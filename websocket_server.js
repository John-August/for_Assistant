// SRT WebSocket server initialization
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const server = new WebSocket.Server({ port: 8765 });

console.log('WebSocket сервер запущен на ws://127.0.0.1:8765');

const logDir = 'C:/logs';
const sevenZipPath = 'C:/logs/7z.exe';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`[INFO] Создана папка для логов: ${logDir}`);
}

let completedSessions = [];
let activeConnections = new Set();
// END WebSocket server initialization
// SRT Handle WebSocket connections
server.on('connection', (ws) => {
    let sessionDir = null;
    let serverLogFile = null;
    let receivedMessages = 0;
    let isSessionInitialized = false;
    let isClosed = false;
    let sessionTimeout;

    activeConnections.add(ws);

    function logToServerFile(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(message);
        if (serverLogFile) {
            fs.appendFileSync(serverLogFile, logMessage);
        }
    }

    function initializeSessionDir() {
        if (isSessionInitialized) return;
        const now = new Date();
        const localTime = now.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
        sessionDir = path.join(logDir, `session_${localTime}`);
        serverLogFile = path.join(sessionDir, 'server_log.txt');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir);
            console.log(`[INFO] Создана папка для сессии: ${sessionDir}`);
        }
        isSessionInitialized = true;
    }

    ws.on('message', (message) => {
        if (isClosed) {
            console.warn("[WARN] Сообщение от закрытого клиента игнорируется.");
            return;
        }

        receivedMessages++;
        console.log(`[DEBUG] Получено сообщение #${receivedMessages}: ${message.toString().slice(0, 100)}...`);

        initializeSessionDir();

        const messageString = message.toString().trim();
        if (messageString.startsWith('{') && messageString.endsWith('}')) {
            try {
                const parsedMessage = JSON.parse(messageString);
                const typeSpecificLogFile = path.join(sessionDir, parsedMessage.type === 'log' ? 'plugin_log.json' : 'results_log.json');
                fs.appendFileSync(typeSpecificLogFile, `${JSON.stringify(parsedMessage.payload, null, 2)}\n`);
                logToServerFile(`[INFO] Лог сохранён в файл: ${typeSpecificLogFile}`);
            } catch (error) {
                logToServerFile(`[ERROR] Невозможно обработать сообщение: ${error.message}`);
            }
        }
    });

    ws.on('close', () => {
        activeConnections.delete(ws);
        console.log('Connection closed.');
        if (sessionTimeout) clearTimeout(sessionTimeout);

        if (sessionDir && receivedMessages > 0) {
            completedSessions.push(sessionDir);
            console.log(`[INFO] Сессия завершена и добавлена в очередь архивации: ${sessionDir}`);
            startArchiving();
        }
    });

    sessionTimeout = setTimeout(() => {
        if (!isSessionInitialized) {
            console.warn("[WARN] Сессия завершена из-за таймаута инициализации.");
            ws.close();
        }
    }, 5000); // 5 секунд
});
// END Handle WebSocket connections
// SRT Ensure command execution and proper result handling
server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const command = message.toString().trim();
        console.log(`[DEBUG] Received command: ${command}`);

        // Execute the command using exec
        exec(`powershell.exe -Command "${command}"`, { encoding: 'utf-8' }, (error, stdout, stderr) => {
            let response;
            if (error) {
                response = `Error: ${stderr}`;
                console.error(`[ERROR] Command execution failed: ${stderr}`);
            } else {
                response = stdout.trim();
                console.log(`[INFO] Command result: ${response}`);
            }
            ws.send(response); // Send the result back to the client
        });
    });
});
// END Ensure command execution and proper result handling
// SRT Archiving completed sessions
function startArchiving() {
    if (completedSessions.length === 0) return;
    const sessionToArchive = completedSessions.shift();
    const archiveName = `${sessionToArchive}.zip`;
    const command = `"${sevenZipPath}" a "${archiveName}" "${sessionToArchive}" -sdel`;
    console.log(`[DEBUG] Выполняем команду 7-Zip: ${command}`);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] Ошибка архивации папки: ${stderr}`);
            console.error(`[DEBUG] Полный вывод ошибки: ${error.message}`);
        } else {
            console.log(`[INFO] Папка архивирована и удалена: ${archiveName}`);
            console.log(`[DEBUG] Вывод команды: ${stdout}`);
        }
        if (completedSessions.length > 0) {
            startArchiving();
        }
    });
}
// END Archiving completed sessions
