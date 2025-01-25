// SRT Utility function to log element information (модифицированный)  
function logElementInfo(element, index) {  
    // ... существующий код создания logEntry ...  

    // Запись в оригинальный лог (полные данные)  
    if (ws.readyState === WebSocket.OPEN) {  
        ws.send(JSON.stringify({ type: "log", payload: logEntry }));  
    }  

    // Фильтрация дубликатов для агрегированного лога  
    const aggregatedLogPath = path.join(sessionDir, 'plugin_log_filtered.json');  
    let existingLogs = [];  
    if (fs.existsSync(aggregatedLogPath)) {  
        existingLogs = JSON.parse(fs.readFileSync(aggregatedLogPath, 'utf-8'));  
    }  

    const isDuplicate = existingLogs.some(entry =>  
        entry.xpath === logEntry.xpath &&  
        JSON.stringify(entry.attributes) === JSON.stringify(logEntry.attributes)  
    );  

    if (!isDuplicate) {  
        existingLogs.push(logEntry);  
        fs.writeFileSync(aggregatedLogPath, JSON.stringify(existingLogs, null, 2));  
    }  

    return logEntry;  
}  
// END Utility function to log element information  
