/* Fill the select box from local storage as soon as the window loads */
window.onload = fillSelectBox;

/* iFrame updating functions */

/**
 * Update all of the frame names. Called when the names box is edited.
 */
function updateNames(e?: Event) {

    let names = (document.getElementById("names") as HTMLDivElement)
        .innerText
        .trim()
        .replace(/^\s*$\n?/gm, "")
        .split("\n");

    for (let i = 0; i < names.length; i++) {
        let container = document.getElementById("screenContainer" + (i + 1));
        if (container) {
            // we have created this screen, just change its name
            let screenTitle = document.getElementById("title" + (i + 1)) as HTMLElement;
            screenTitle.innerText = names[i];
        } else {
            // create the screen
            const outerContainer = document.getElementById("container") as HTMLElement;
            outerContainer.insertAdjacentHTML("beforeend", `
            <div class="studentScreen" id="screenContainer${i + 1}">
                <p class="screenTitle"><span id="title${i + 1}">${names[i]} </span><a href="#" onclick="refreshFrame(event, ${i + 1})">Refresh</a></p>
            </div>`)
            let container = document.getElementById(`screenContainer${i + 1}`) as HTMLElement;
            container.insertAdjacentHTML("beforeend", "<p class=\"error\">You do not yet have a URL for this name.</p>");
        }
    }
}

/**
 * Update all of the frame URLS. Called when the url box is edited.
 */
function updateURLs(e?: Event) {
    let urls = (document.getElementById("urls") as HTMLElement)
        .innerText.trim()
        .replace(/^\s*$\n?/gm, "")
        .split("\n");
    let names = (document.getElementById("names") as HTMLElement)
        .innerText
        .trim()
        .replace(/^\s*$\n?/gm, "")
        .split("\n");

    let urlParse: URL;
    let url: string;
    const outerContainer = document.getElementById("container") as HTMLElement;
    for (let i = 0; i < urls.length; i++) {
        let name = names[i] || "Student" + (i + 1);
        try {
            urlParse = new URL(urls[i]);
            if (urlParse.hostname === "repl.it" || urlParse.hostname === "www.repl.it") {
                url = "https://repl.it" + urlParse.pathname + "?lite=true" + urlParse.hash;
            } else {
                url = urls[i];
            }
        } catch (e) {
            url = "";
        }
        let container = document.getElementById("screenContainer" + (i + 1));
        if (container) {
            // we have a screen for this url, lets see if it is correct
            let ifr = container.querySelector("iframe");
            if (ifr && ifr.src === url) {
                continue; //skip to the next run of the loop
            } else {
                //since the url is wrong, lets just start over
                container.innerHTML = (` <p class="screenTitle"><span id="title${i + 1}">${name} </span><a href="#" onclick="refreshFrame(event, ${i + 1})">Refresh</a></p>`)
            }
        } else {

            outerContainer.insertAdjacentHTML("beforeend", `
            <div class="studentScreen" id="screenContainer${i + 1}">
                <p class="screenTitle"><span id="title${i + 1}">${name} </span><a href="#" onclick="refreshFrame(event, ${i + 1})">Refresh</a></p>
            </div>`)
            container = document.getElementById(`screenContainer${i + 1}`) as HTMLElement;
        }

        if (url === "") {
            container.insertAdjacentHTML("beforeend", "<p class='error'>The URL for this screen is not valid</p>");
        } else {
            container.insertAdjacentHTML("beforeend", `
                    <iframe class="embed" src="${url}" 
                        scrolling="no" 
                        frameborder="no" 
                        allowtransparency="true" 
                        allowfullscreen="true" 
                        sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-modals">
                    </iframe>`);

        }

    }
}


/**
 * Refresh a given frame
 * @param n which frame to update?
 */
function refreshFrame(e: Event, n: number) {
    e.preventDefault();
    let ctr = document.getElementById(`screenContainer${n}`) as HTMLElement;
    if (ctr) {
        let ifr = ctr.querySelector("iframe");
        if (ifr) {
            (ifr.parentNode as Node)
                .replaceChild(ifr.cloneNode(), ifr);
        }
    }

}

/**
 * Refresh all of the frames
 */
function refreshAll(e?: Event) {
    let alliFrs = document.querySelectorAll("iframe");
    if (!alliFrs) return;
    alliFrs.forEach(ifr => {
        (ifr.parentNode as Node).replaceChild(ifr.cloneNode(), ifr);
    });
}

/* Interface and storage functions */

/**
 * Shows and hides the control panel
 */

function showHideEntries() {
    let showHide = document.getElementById("showHide") as HTMLElement;
    let entryHolder = document.getElementById("entryHolder") as HTMLElement;
    let inst = document.getElementById("instructions") as HTMLElement;
    let rap = document.getElementById("refreshAllParagraph") as HTMLElement;
    let slc = document.getElementById("saveLoadControls") as HTMLElement;
    if (showHide.innerText === "—") {

        entryHolder.style.display = "none";
        inst.style.display = "none";
        showHide.innerText = "+";
        rap.style.writingMode = "vertical-lr";
        slc.style.display = "none";

    } else {
        entryHolder.style.display = "flex";
        inst.style.display = "block";
        showHide.innerText = "—";
        rap.style.writingMode = "";
        slc.style.display = "block";
    }
}

/**
 * Save the list into local storage
 */

function saveList(event?: Event) {
    let listName = (document.getElementById("saveListName") as HTMLInputElement).value;
    let URLs = (document.getElementById("urls") as HTMLElement).innerText;
    let names = (document.getElementById("names") as HTMLElement).innerText;
    let current = localStorage.getItem("replit-list-" + listName);
    if (current) {
        let ret = confirm("You already have a list called " + listName + ", are you sure you want to ovewrite it?");
        if (ret === false) return;
    }
    localStorage.setItem("replit-list-" + listName,
        JSON.stringify({
            urls: URLs,
            names: names,
        }));
    fillSelectBox();
}

/** Load a list from local storage */
function loadList(event?: Event) {
    let urls = document.getElementById("urls") as HTMLElement;
    let names = document.getElementById("names") as HTMLElement;
    let listName = (document.getElementById("loadListName") as HTMLInputElement).value;
    if (urls.innerText !== "" || names.innerText !== "") {
        let ret = confirm(`Are you sure you want to load list ${listName}? This will overwrite the current names and URLs.`);
        if (ret == false) {
            return;
        }
    }
    let itemText = localStorage.getItem("replit-list-" + listName) as string;
    let item = JSON.parse(itemText);
    urls.innerText = item.urls;
    names.innerText = item.names;
    updateNames();
    updateURLs();
}

/** Delete a single list from local storage */
function deleteList(event?: Event) {
    let urls = document.getElementById("urls");
    let names = document.getElementById("names");
    let listName = (document.getElementById("loadListName") as HTMLInputElement).value;
    let ret = confirm(`Are you sure you want to delete the list ${listName}?`);
    if (ret === true) {
        localStorage.removeItem("replit-list-" + listName);
        fillSelectBox();
    }
}

/** Delete all lists in local storage */
function deleteAll() {
    let ret = confirm(`Are you sure you want to delete ALL of your saved lists? This is not reversible!`);
    if (ret === false) return;
    Object.keys(localStorage).forEach(key => {
        if (key.substring(0, 12) === "replit-list-") {
            localStorage.removeItem(key);
        }
    });
    fillSelectBox();
}

/** Looks up lists in local storage and creates the select box options */
function fillSelectBox() {
    let sel = document.getElementById("loadListName") as HTMLSelectElement;
    sel.innerHTML = "";
    Object.keys(localStorage).forEach(key => {
        if (key.substring(0, 12) === "replit-list-") {
            let name = key.substring(12);
            sel.insertAdjacentHTML("beforeend",
                `<option value="${name}">${name}</option>`);
        }
    });

}

/* UTILITY FUNCTIONS */

/**
 * Strip the HTML from any pasted element so it pastes as plain text
 */
function stripPaste(e: ClipboardEvent) {
    e.preventDefault();
    if (!e.clipboardData) return;
    if (e.clipboardData) {
        /** @type {string} */
        var text = e.clipboardData.getData('text/plain');

        document.execCommand('inserttext', false, text + "\n");
        if ((e.currentTarget as Element).id === "urls") {
            updateURLs();
        } else {
            updateNames();
        }
    }

}