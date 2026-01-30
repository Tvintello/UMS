import BrowserManager from "./browser_manager.js";


class StorageManager {
    constructor(action) {
        this.action = action;
        this.storage = BrowserManager.browser.storage;
    }

    async getPacks() {
        const result = await this.storage.local.get('storedPacks');
        const storedPacks = result.storedPacks || {};
        return storedPacks;
    }

    base64ToBlob(base64, mimeType = '') {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }
        return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
    }
    
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    async fileToBase64(file, image=true) {
        if (image && file.type.split("/")[0] != "image") {
            this.action.error(file.name + " file is not an image");
            return;
        }
        const buffer = await this.readFileAsArrayBuffer(file);
        const base64 = this.arrayBufferToBase64(buffer);
        const fileData = {
            name: file.name,
            data: base64,
            type: file.type,
            timestamp: Date.now()
        };
        return fileData;
    }

    async deletePack(packname) {
        const storedPacks = await this.getPacks();
        delete storedPacks[packname];
        this.storage.local.set({"storedPacks": storedPacks});
        console.log("Deleted pack: ", packname)
    }

    async savePacks(base64Packs) {
        let newPacks = {};
        for (let packname in base64Packs) {
            let pack = [];
            for (let file of base64Packs[packname]) {
                pack.push(file);
            }
            newPacks[packname] = pack;
        }    
        try {
            const stored = await this.getPacks()
            const data = {'storedPacks': {...stored, ...newPacks}};
            await this.storage.local.set(data);
            console.log("Saved packs: ", newPacks);
            console.log("All saved packs: ", data);
        } catch {
            console.error("Could not save pack to the local storage!");
        }
        

        return newPacks;
    }
    
    async saveSticker(packname, base64File) {
        const storedPacks = await this.getPacks();
        storedPacks[packname][filename] = base64File;
        await this.storage.local.set({ storedPacks });
        
        return filename;
    }

};

export default StorageManager;