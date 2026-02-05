import StorageManager from "../scripts/storage_manager.js";
import ActionManager from "../scripts/action_manager.js";


const action =  new ActionManager(document.getElementById("noteBlock"));
const storage_manager = new StorageManager(action);


async function deleteBtnFunction(del_btn) {
    del_btn.style["display"] = "none";

    let safe_del_btn = del_btn.parentNode.querySelector(".yes_delete_pack");
    safe_del_btn.style["display"] = "block";
    safe_del_btn.addEventListener("click", async () => {
        del_btn.parentNode.parentNode.parentNode.remove()
        await storage_manager.deletePack(del_btn.parentNode.parentNode.querySelector(".pack_name").innerHTML)
    });
    
    let discard_btn = del_btn.parentNode.querySelector(".no_delete_pack");
    discard_btn.style["display"] = "block";
    discard_btn.addEventListener("click", () => {
        del_btn.style["display"] = "block";
        discard_btn.style["display"] = "none";
        safe_del_btn.style["display"] = "none";
    })
}


function deletePackPreview(packname) {
    const list = document.querySelectorAll('.pack_name');
    for (let name of list) {
        if (name.innerHTML == packname) {
            name.parentNode.parentNode.remove()
        }
    }
}


async function updatePackPreview(pack, packname) {
    for (let child of document.querySelector('.packs.list').children) {
        const packname_node = child.querySelector(".packs__header.info > .pack_name")
        if (packname_node && packname_node.innerHTML == packname) {
            child.querySelector(".packs__preview.list").innerHTML = "";
            for (let sticker of pack.data) {
                let preview_elem = document.createElement("li");
                preview_elem.setAttribute("class", "packs__preview elem")
                preview_elem.innerHTML = `
                <img class="packs__preview__img" src="data:${sticker.type};base64,${sticker.data}" alt="sticker">
                `;
                child.querySelector(".packs__preview.list").appendChild(preview_elem);
            }
        }
    }
}


// Create new pack preview
function appendPackPreview(pack, packname) {
    deletePackPreview(packname);

    let icon_style = storage_manager.getPackIconStyle(pack);

    let pack_block = document.createElement("li");
    pack_block.setAttribute('class', 'packs elem');

    let preview_list = "";

    for (let file of pack.data) {
        let preview_elem = `
        <li class="packs__preview elem">
            <img class="packs__preview__img" src="data:${file.type};base64,${file.data}" alt="sticker">
        </li>
        `;
        
        preview_list += preview_elem;
    }

    pack_block.innerHTML = `
    <div class="packs__header info">
        <div class="icon" style="${icon_style}" alt="icon"></div>
        <span class="pack_name">${packname}</span>
        <div class="tools">
            <button class="general_btn add_stickers">Add stickers</button>
            <button class="general_btn danger_btn delete_pack">Delete</button>
            <button class="general_btn danger_btn yes_delete_pack" style="display: none; width: 80px;">Yes?</button>
            <button class="general_btn safe_btn no_delete_pack" style="display: none; width: 80px;">No?</button>
        </div>
    </div>
    <div class="packs__preview block">
        <ul class="packs__preview list">
            ${preview_list}
        </ul>
    </div>
    `;

    document.querySelector('.packs.list').appendChild(pack_block)

    let delete_btn = document.querySelectorAll(".delete_pack");
    delete_btn = delete_btn[delete_btn.length - 1];
    delete_btn.addEventListener("click", () => deleteBtnFunction(delete_btn))

    let add_stickers_btn = document.querySelectorAll(".add_stickers");
    add_stickers_btn = add_stickers_btn[add_stickers_btn.length - 1];
    add_stickers_btn.addEventListener("click", () => {
        openOSFileManager(async function (e) {
            const updated_pack = await storage_manager.saveStickers(packname, e.target.files);
            await updatePackPreview(updated_pack, packname)
        }, true, false)
    })
}


function openOSFileManager(onchange, multiple=false, directory=false) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    input.webkitdirectory = directory;
    input.onchange = onchange;
    input.click()
    return input
}

document.addEventListener('DOMContentLoaded', async function() {
    // DEBUGGING FUNCTION TO DELETE SAVED PACKS UPON CLICKING
    // storage_manager.storage.local.set({"storedPacks": {}})
    // DEBUGGING FUNCTION TO DELETE SAVED PACKS UPON CLICKING

    // Loading packs upon opening the page
    console.log("Loading packs...");
    let packs = await storage_manager.getPacks();
    console.log(packs);
    for (let packname in packs) {
        console.log(`Loading ${packname}...`)
        appendPackPreview(packs[packname], packname);
    }
    console.log("Packs were loaded");
});


document.getElementById("addPlentyPacks").addEventListener("click", () => {
    openOSFileManager(async function (e) {
        console.log("Analyzing packs...");
        const files = e.target.files;
        let packs = {};
        let packIndex = -1;
        const stored = await storage_manager.getPacks();
        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            // Organizing stickers in packs
            let folder = file.webkitRelativePath.split("/")[1]
            if (folder && folder != file.name) {
                // If new pack found
                if (!packs[folder]) {
                    // Appending sticker pack to html
                    if (packIndex != -1) {
                        let previous_folder = files[i - 1].webkitRelativePath.split("/")[1]
                        appendPackPreview(packs[previous_folder], previous_folder)
                    };

                    console.log("Processing pack: ", folder);
                    packs[folder] = [];
                    packIndex++;
                };
                // Collecting files to packs array
                if (packs && packs[folder]) {
                    const data = await storage_manager.fileToBase64(file);
                    if (!data) {console.log("Could not add the chosen packs!"); return;}
                    packs[folder].push(data);
                    console.log("Collected image: ", file)
                }
            }   
        };
        // Append last remaining pack to html
        let last_pack = files[files.length - 1].webkitRelativePath.split("/")[1];
        if (packIndex != -1) {
            appendPackPreview(packs[last_pack], last_pack)
            await storage_manager.savePacks(packs)
        } else action.error("No packs were found!")
    }, false, true);
})


document.getElementById("addPack").addEventListener("click", () => {
    openOSFileManager(
        async function (e) {
            const files = e.target.files;
            let packname = files[0].webkitRelativePath.split("/")[0]
            const stored = await storage_manager.getPacks();
            if (packname in stored) {
                if (!confirm(`Pack with name "${packname}" already exists! Do you want to replace it?`)) {
                    return;
                }
            }

            console.log(`Saving pack: ${packname}...`);
            let packs = {[packname]: {"data": [], "icon": null}};
            for (let file of files) {
                // Converting files to base64 file format and collecting them
                const data = await storage_manager.fileToBase64(file);
                if (!data) {console.log("Could not add the chosen pack!"); return;}
                packs[packname].data.push(data);
                console.log("Collected image: ", file)
            }
            console.log(packs);
            await storage_manager.savePacks(packs);
    
            // Appending sticker pack to html
            appendPackPreview(packs[packname], packname);
        },
    false, true);
})


document.querySelector(".packs__header.subtools > .choose_icon").addEventListener("click", () => {
    const thisNode = document.querySelector(".packs__header.subtools > .choose_icon")
    openOSFileManager(async (e) => {
        const file = e.target.files[0];
        let icon = await storage_manager.fileToBase64(file);
        thisNode.style["background-image"] = `url(data:${icon.type};base64,${icon.data})`;
        thisNode.setAttribute("type", icon.type);
        thisNode.setAttribute("data", icon.data);
    })
})


document.querySelector(".packs__header.subtools > .confirm").addEventListener("click", async () => {
    const packname = document.querySelector(".packs__header.subtools > .pack_name").value;

    if (!packname) {
        action.error("You forgot to create a name for this pack!");
        return;
    }

    const stored = await storage_manager.getPacks();
    if (packname in stored) {
        action.error(`Pack with name "${packname}" already exists!`)
        return;
    }

    const icon = document.querySelector(".packs__header.subtools > .choose_icon");
    const pack = {data: [], "icon": {"data": icon.getAttribute("data"), "type": icon.getAttribute("type")}}
    appendPackPreview(pack, packname);
    await storage_manager.savePacks({[packname]: pack})
})


document.getElementById("createBlankPack").addEventListener("click", () => {
    if (document.getElementById("createBlankPack").toggleAttribute("toggled")) {
        document.querySelector(".packs__header.subtools").style.removeProperty("display");
    } else {
        document.querySelector(".packs__header.subtools").style["display"] = "none";
    }
})