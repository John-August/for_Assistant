
// Diagnostic script version diagnostic-0.34
const diagnosticVersion = "diagnostic-0.34";

console.log(`Diagnostic Test (Version: ${diagnosticVersion})`);

let attemptCount = parseInt(localStorage.getItem('attemptCount')) || 0;
let pageReloadCount = parseInt(localStorage.getItem('pageReloadCount')) || 0;
const successfulFinds = [];
const sessionFinds = new Set();
const maxAttempts = 1000;
const attemptsPerPage = 100;
let successfulAttempts = 0;

// WebSocket connection with auto-reconnect
let ws;
function connectWebSocket() {
    ws = new WebSocket("ws://127.0.0.1:8765");

    ws.addEventListener('open', () => {
        console.log("WebSocket connection established for diagnostics.");
    });

    ws.addEventListener('error', (error) => {
        console.error("WebSocket error:", error);
    });

    ws.addEventListener('close', () => {
        console.warn("WebSocket connection closed. Attempting to reconnect...");
        setTimeout(connectWebSocket, 3000);
    });
}
connectWebSocket();

// Utility function to send results to the server
function sendResultsToServer() {
    const metadata = {
        diagnosticVersion,
        attemptCount,
        pageReloadCount,
        successCount: successfulAttempts,
        uniqueCount: successfulFinds.length,
        timestamp: new Date().toISOString(),
    };

    const payload = {
        type: "results",
        payload: {
            metadata,
            successfulFinds
        }
    };

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
        console.log("Results sent to server:", JSON.stringify(payload));
    } else {
        console.error("WebSocket is not open. Results not sent.");
    }
}

// DOM observation for dynamic changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            console.log("DOM mutation detected. Retrying chat box search.");
            findAndTestChatBox();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

function findAndTestChatBox() {
    const potentialChatBoxes = document.querySelectorAll("textarea, input[type='text'], div[contenteditable='true'], [role='textbox']");
    potentialChatBoxes.forEach((element, index) => {
        try {
            const boundingRect = element.getBoundingClientRect();
            if (boundingRect.width < 600 || boundingRect.height < 20) {
                console.log(`Skipping element ${index} due to size.`);
                return;
            }

            element.focus();
            element.value = `Diagnostic Test (Version: ${diagnosticVersion})`;

            const inputEvent = new Event('input', { bubbles: true });
            element.dispatchEvent(inputEvent);

            if (element.value !== `Diagnostic Test (Version: ${diagnosticVersion})`) {
                console.warn(`Text insertion verification failed for element ${index}.`);
                return;
            }

            console.log(`Successful interaction with element ${index}. BoundingRect:`, boundingRect);
            successfulAttempts++;
        } catch (error) {
            console.error(`Failed to interact with element ${index}:`, error);
        }
    });

    attemptCount++;
    localStorage.setItem('attemptCount', attemptCount);

    if (attemptCount % attemptsPerPage === 0) {
        pageReloadCount++;
        localStorage.setItem('pageReloadCount', pageReloadCount);
        console.log(`Reloading page. Reload count: ${pageReloadCount}`);
        location.reload();
    }

    if (attemptCount >= maxAttempts) {
        console.log("Maximum attempts reached. Sending results to server.");
        sendResultsToServer();
    }
}

findAndTestChatBox();
