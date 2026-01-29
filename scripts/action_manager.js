class ActionManager {
    constructor() {
    }

    error(text) {
        alert(text);
        console.log(text);
    }
};

const actionManager = new ActionManager();
export default actionManager;