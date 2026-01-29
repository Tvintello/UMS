class BrowserManager {
    constructor() {
        this.browser = 'undefined';
        if (typeof browser !== 'undefined') {
            this.browser = browser;
        } else if (typeof chrome !== 'undefined') {
            this.browser = chrome;
        } else {
            console.error("Browser API is not provided!")
        }
    }
};

const browserManager = new BrowserManager();
export default browserManager;