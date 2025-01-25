// Diagnostic Plugin
// SRT Initialize diagnostics
const diagnosticVersion = "diagnostic-0.34";

console.log(`Diagnostic Test (Version: ${diagnosticVersion})`);

let attemptCount = parseInt(localStorage.getItem('attemptCount')) || 0;
let pageReloadCount = parseInt(localStorage.getItem('pageReloadCount')) || 0;
const successfulFinds = [];
const sessionFinds = new Set();
const maxAttempts = 50;
const attemptsPerPage = 100;
let successfulAttempts = 0;
// END Initialize diagnostics
// SRT WebSocket connection with auto-reconnect
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
// END WebSocket connection with auto-reconnect
// SRT Utility function to log element information
function logElementInfo(element, index) {
    const boundingRect = element.getBoundingClientRect();
    const xpath = getElementXPath(element);
    const attributes = {};
    for (let attr of element.attributes) {
        attributes[attr.name] = attr.value;
    }
    const logEntry = {
        index,
        boundingRect,
        xpath,
        attributes,
        visible: boundingRect.width > 0 && boundingRect.height > 0,
        textContent: element.textContent.trim()
    };
    console.log(`Element ${index}:`, logEntry);

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "log", payload: logEntry }));
    } else {
        console.warn("WebSocket is not open. Log not sent.");
       if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
           if (ws.readyState === WebSocket.CLOSED) {
               ws.send(JSON.stringify({ type: "warning", payload: "WebSocket connection is closed. Log not sent." }));
           } else {
               ws.send(JSON.stringify({ type: "warning", payload: "WebSocket connection is closing. Log not sent." }));
           }
       }
    }

    return logEntry;
}
// END Utility function to log element information
// SRT Generate XPath for an element
function getElementXPath(element) {
    if (element.id) {
        return `//*[@id='${element.id}']`;
    }
    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let siblingIndex = 0;
        let sibling = element;
        while ((sibling = sibling.previousElementSibling) != null) {
            siblingIndex++;
        }
        const tagName = element.tagName.toLowerCase();
        const pathIndex = siblingIndex ? `[${siblingIndex + 1}]` : "";
        parts.unshift(`${tagName}${pathIndex}`);
        element = element.parentNode;
    }
    return parts.length ? "/" + parts.join("/") : null;
}
// END Generate XPath for an element
// SRT Find and test chat box
function findAndTestChatBox() {
    const potentialChatBoxes = document.querySelectorAll("textarea, input[type='text'], div[contenteditable='true'], [role='textbox']");
    potentialChatBoxes.forEach((element, index) => {
        try {
            const logEntry = logElementInfo(element, index);

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

            if (!sessionFinds.has(logEntry.xpath)) {
                sessionFinds.add(logEntry.xpath);
                successfulFinds.push(logEntry);
            }
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
        // // location.reload();
        return;
    }

    if (attemptCount >= maxAttempts) {
        console.log("Maximum attempts reached. Sending results to server.");
        sendResultsToServer();
    }
}
// END Find and test chat box
// SRT Send results to server
function sendResultsToServer() {
    const metadata = {
        diagnosticVersion,
        attemptCount,
        pageReloadCount,
        successCount: successfulAttempts,
        uniqueCount: successfulFinds.length,
        timestamp: new Date().toISOString(),
    };

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "results", payload: { metadata, successfulFinds } }));
        console.log("Results sent to server.");
    } else {
        console.warn("WebSocket is not open. Results not sent.");
    }
}
// END Send results to server
// SRT DOM observation for dynamic changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            console.log("DOM mutation detected. Retrying chat box search.");
            findAndTestChatBox();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });
// END DOM observation for dynamic changes
// SRT Main execution
findAndTestChatBox();
console.log("Diagnostic Test Version Updated: diagnostic-0.34");
// END Main execution
