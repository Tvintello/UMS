function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function saveFilesToStorage(filename, base64Data, mimeType) {
    const fileData = {
        name: filename,
        data: base64Data,
        type: mimeType,
        timestamp: Date.now()
    };
    
    // Используем browser.storage (для Firefox) или chrome.storage (для Chrome)
    const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
    
    // Получаем текущие файлы
    const result = await storage.local.get('storedFiles');
    const storedFiles = result.storedFiles || {};
    
    // Добавляем новый файл
    storedFiles[filename] = fileData;
    
    // Сохраняем обратно
    await storage.local.set({ storedFiles });
    
    return filename;
}



document.addEventListener('DOMContentLoaded', function() {
    console.log("BACKGROUND LOADED")
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message")
    if (message.action === "openFileDialog") {
        // Создаем input в background странице
        console.log("recieved");
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async function (event) {
            console.log("CHANGED")
            for (file in event.target.files) {
                if (file) {
                    try {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const base64Data = arrayBufferToBase64(arrayBuffer);
                    
                    await saveFileToStorage(file.name, base64Data, file.type);
                    
                    console.log('Файл сохранен:', file.name);
                    } catch (error) {
                    console.error('Ошибка сохранения файла:', error);
                    }
                }
            }
        };
        input.click();
    }
});