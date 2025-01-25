// SRT Send results to server (модифицированный)  
function sendResultsToServer() {  
    const metadata = {  
        diagnosticVersion,  
        attemptCount,  
        pageReloadCount,  
        successCount: successfulAttempts,  
        uniqueCount: successfulFinds.length,  
        timestamp: new Date().toISOString(),  
    };  

    // Оригинальный results_log.json (полные данные)  
    const originalResults = { metadata, successfulFinds };  
    if (ws.readyState === WebSocket.OPEN) {  
        ws.send(JSON.stringify({ type: "results", payload: originalResults }));  
    }  

    // Создание агрегированной версии (только уникальные элементы)  
    const uniqueFindsMap = new Map();  
    successfulFinds.forEach(find => {  
        if (!uniqueFindsMap.has(find.xpath)) {  
            uniqueFindsMap.set(find.xpath, find);  
        }  
    });  

    const aggregatedResults = {  
        metadata: { ...metadata, uniqueCount: uniqueFindsMap.size },  
        successfulFinds: Array.from(uniqueFindsMap.values())  
    };  

    // Запись в отдельный файл  
    const aggregatedPath = path.join(sessionDir, 'results_summary.json');  
    fs.writeFileSync(aggregatedPath, JSON.stringify(aggregatedResults, null, 2));  
}  
// END Send results to server  
