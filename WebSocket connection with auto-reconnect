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
