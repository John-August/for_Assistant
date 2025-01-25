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
