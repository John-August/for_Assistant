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
