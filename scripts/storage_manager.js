import BrowserManager from "./browser_manager.js";


class StorageManager {
    constructor(action) {
        this.action = action;
        this.storage = BrowserManager.browser.storage;
    }

    getPackIcon(pack) {
        if (pack.icon) {
            return pack.icon;
        } else if (pack.data) {
            return pack.data[0];
        }
        return '';
    }

    getPackIconStyle(pack) {
        const icon = this.getPackIcon(pack);
        return icon ? `background-image: url(data:${icon.type};base64,${icon.data});`: '';
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
        try {
            const stored = await this.getPacks()
            const data = {'storedPacks': {...stored, ...base64Packs}};
            await this.storage.local.set(data);
            console.log("Saved packs: ", base64Packs);
            console.log("All saved packs: ", data);
        } catch {
            console.error("Could not save pack to the local storage!");
        }
        return base64Packs;
    }
    
    async saveStickers(packname, files) {
        const storedPacks = await this.getPacks();

        if (!(packname in storedPacks)) {
            console.log(`There is no ${packname} pack stored`);
            return;
        }

        for (let file of files) {
            const sticker = await this.fileToBase64(file);
            storedPacks[packname].data.push(sticker);
        }
        console.log("New stickers:", files)
        console.log(packname, "pack:", storedPacks[packname])
        console.log("All saved packs", storedPacks);
        await this.storage.local.set({"storedPacks": storedPacks});
        
        return storedPacks[packname];
    }
};

export default StorageManager;