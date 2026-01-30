import StorageManager from "../scripts/storage_manager.js";
import BrowserManager from "../scripts/browser_manager.js";
import ActionManager from "../scripts/action_manager.js";


const action =  new ActionManager(document.getElementById("noteBlock"));
const storage_manager = new StorageManager(action);


document.addEventListener('DOMContentLoaded', async function() {
    const packs = await storage_manager.getPacks();

    for (let packname in packs) {
        let icon = packs[packname][0]
        let pack_block = document.createElement("li");
        pack_block.setAttribute("class", "pack block");
        pack_block.setAttribute("id", packname);

        let sticker_list = document.createElement("div");
        sticker_list.setAttribute("class", "pack img_wrapper")
        for (let file of packs[packname]) {
            let img = document.createElement("img");
            img.setAttribute("class", "sticker");
            img.setAttribute("src", `data:${file.type};base64,${file.data}`);
            img.setAttribute("title", "LMB to copy " + file.name);
            img.style["cursor"] = "pointer";
            img.addEventListener("click", () => {
                navigator.clipboard.write([
                    new ClipboardItem({
                        [file.type]: storage_manager.base64ToBlob(file.data, file.type)
                    })
                ])
                console.log("Image copied: ", file.name)
            })
            sticker_list.appendChild(img);
        }

        pack_block.innerHTML = `
        <div class="pack_header">
            <div style="background-image: url(data:${icon.type};base64,${icon.data});" class="icon")></div>
            <div class="pack title">${packname}</div>
        </div>
        `
        pack_block.appendChild(sticker_list)

        document.querySelector(".pack.list").appendChild(pack_block);

        let pack_btn_li = document.createElement("li");
        pack_btn_li.setAttribute("class", "header_pack_element");

        let pack_btn = document.createElement("a");
        pack_btn.setAttribute("class", "header_button icon");
        pack_btn.setAttribute("style", `width: 30px; height: 30px; display: block; margin: 0; background-image: url(data:${icon.type};base64,${icon.data})`);
        pack_btn.setAttribute("href", "#" + packname);

        pack_btn_li.appendChild(pack_btn);
        document.querySelector(".header.list").appendChild(pack_btn_li);
        document.getElementById("noteBlock").style["display"] = "none";
    }

    document.getElementById("settings").addEventListener("click", () => {
        BrowserManager.browser.tabs.create({
            url: BrowserManager.browser.runtime.getURL('../options/options.html'),
            active: true
        })
    })
});



