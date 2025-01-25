// SRT Archiving completed sessions (модифицированный)  
function startArchiving() {  
    if (completedSessions.length === 0) return;  
    const sessionToArchive = completedSessions.shift();  

    // Убедимся, что все файлы записаны  
    const filesToCheck = [  
        'plugin_log.json',  
        'results_log.json',  
        'plugin_log_filtered.json',  
        'results_summary.json'  
    ];  

    let retries = 0;  
    const checkFiles = () => {  
        const allFilesExist = filesToCheck.every(file =>  
            fs.existsSync(path.join(sessionToArchive, file))  
        );  

        if (allFilesExist || retries >= 3) {  
            const archiveName = `${sessionToArchive}.zip`;  
            const command = `"${sevenZipPath}" a "${archiveName}" "${sessionToArchive}\\*" -sdel`; // Добавлен маска "*" для всех файлов  
            console.log(`[DEBUG] Архивация: ${command}`);  
            exec(command, (error) => {  
                if (error) console.error(`[ERROR] Ошибка архивации: ${error.message}`);  
                else console.log(`[INFO] Сессия заархивирована: ${archiveName}`);  
            });  
        } else {  
            retries++;  
            setTimeout(checkFiles, 500);  
        }  
    };  

    checkFiles();  
}  
// END Archiving completed sessions  
