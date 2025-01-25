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
