// SRT Handle WebSocket connections (модифицированный)  
server.on('connection', (ws) => {  
    // ... существующий код инициализации ...  

    ws.on('message', (message) => {  
        // ... существующий код обработки сообщений ...  

        if (messageString.startsWith('{') && messageString.endsWith('}')) {  
            try {  
                const parsedMessage = JSON.parse(messageString);  

                // Обработка оригинальных логов  
                if (parsedMessage.type === 'log' || parsedMessage.type === 'results') {  
                    const originalLogFile = path.join(sessionDir, `${parsedMessage.type}_log.json`);  
                    fs.appendFileSync(originalLogFile, `${JSON.stringify(parsedMessage.payload, null, 2)}\n`);  
                }  

                // Обработка агрегированных логов (новые типы)  
                if (parsedMessage.type === 'filtered_log' || parsedMessage.type === 'summary_results') {  
                    const aggregatedLogFile = path.join(sessionDir, `${parsedMessage.type}.json`);  
                    const existingData = fs.existsSync(aggregatedLogFile)  
                        ? JSON.parse(fs.readFileSync(aggregatedLogFile, 'utf-8'))  
                        : [];  

                    // Объединение данных без дубликатов  
                    const mergedData = [...existingData, ...parsedMessage.payload];  
                    const uniqueData = Array.from(new Map(mergedData.map(item => [item.xpath, item])).values());  
                    fs.writeFileSync(aggregatedLogFile, JSON.stringify(uniqueData, null, 2));  
                }  

            } catch (error) {  
                logToServerFile(`[ERROR] Ошибка обработки JSON: ${error.message}`);  
            }  
        }  
    });  

    // ... существующий код обработки закрытия соединения ...  
});  
// END Handle WebSocket connections  
