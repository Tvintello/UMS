document.addEventListener('DOMContentLoaded', async function() {
    const placeholder_list = document.querySelectorAll(".placeholder");
    for (const placeholder of placeholder_list) {
        const observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
                if (mutation.type == "childList") {
                    if (placeholder.parentElement.children.length == 1) {
                        placeholder.style.removeProperty("display");
                    } else {
                        placeholder.style["display"] = "none";
                    }
                }
            }
        })
        observer.observe(placeholder.parentElement, {childList: true})
    }
});