import StorageManager from "./storage_manager";

class SettingsManager {
    constructor(defaultSettings = {}) {
        this.defaultSettings = defaultSettings;
        this.settings = {};
    }
  
    async init() {
        const saved = await this.load();
        this.settings = { ...this.defaultSettings, ...saved };
        return this.settings;
    }
  
    async load() {
        try {
            const result = await StorageManager.storage.get('extensionSettings');
            return result.extensionSettings || {};
        } catch (error) {
            console.error('Failed to load settings:', error);
            return {};
        }
    }

    async save(newSettings = null) {
        if (newSettings) {
            this.settings = { ...this.settings, ...newSettings };
        }
        
        try {
            await browser.storage.local.set({
            extensionSettings: this.settings
            });
            console.log('Settings saved:', this.settings);
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
  
    get(key) {
        return this.settings[key] ?? this.defaultSettings[key];
    }
  
    set(key, value) {
        this.settings[key] = value;
        return this.save({ [key]: value });
    }
  
    reset() {
        this.settings = { ...this.defaultSettings };
        return this.save();
    }
  }
  
  const DEFAULT_SETTINGS = {
    packs: []
};
  
const settingsManager = new SettingsManager(DEFAULT_SETTINGS);
export default settingsManager;