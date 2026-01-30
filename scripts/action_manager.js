class ActionManager {
    constructor(NoteNode=undefined) {
        this.note = NoteNode;
    }
    
    error(text) {
        this.note.style["display"] = "block";
        this.note.innerHTML = text;
        console.error(text);
        if (this.note.classList.contains("error")) return;
        this.note.classList.remove("notification");
        this.note.classList.add("error");
    }

    notify(text) {
        this.note.style["display"] = "block";
        this.note.innerHTML = text;
        console.log(text);
        if (this.note.classList.contains("notification")) return;
        this.note.classList.remove("error");
        this.note.classList.add("notification");
    }

};

export default ActionManager;