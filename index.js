window.onload = fillSelectBox;

function stripPaste(e) {
    e.preventDefault();
    if (!e.clipboardData) return;
    if (e.clipboardData) {
        text = e.clipboardData.getData('text/plain');
    }
    document.execCommand('inserttext', false, text + "\n");
    if (e.currentTarget.id === "urls") {
        updateURLs();
    } else {
        updateNames();
    }

}

function updateNames(e) {
    let names = document.getElementById("names").innerText.trim().replaceAll(/^\s*$\n?/gm, "").split("\n");
    for (let i = 0; i < names.length; i++) {
        let container = document.getElementById("screenContainer" + (i + 1));
        if (container) {
            // we have created this screen, just change its name
            let screenTitle = document.getElementById("title" + (i + 1));
            screenTitle.innerText = names[i];
        } else {
            // create the screen
            const outerContainer = document.getElementById("container");
            outerContainer.insertAdjacentHTML("beforeend", `
            <div class="studentScreen" id="screenContainer${i + 1}">
                <p class="screenTitle"><span id="title${i + 1}">${names[i]} </span><a href="#" onclick="refreshFrame(event, ${i + 1})">Refresh</a></p>
            </div>`)
            let container = document.getElementById(`screenContainer${i + 1}`);
            container.insertAdjacentHTML("beforeend", "<p class=\"error\">You do not yet have a URL for this name.</p>");
        }
    }
}

function updateURLs(e) {
    let urls = document.getElementById("urls").innerText.trim().replaceAll(/^\s*$\n?/gm, "").split("\n");
    let names = document.getElementById("names").innerText.trim().replaceAll(/^\s*$\n?/gm, "").split("\n");
    let url;
    const outerContainer = document.getElementById("container");
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
            container = document.getElementById(`screenContainer${i + 1}`);
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


function showHideEntries() {
    let showHide = document.getElementById("showHide");
    let entryHolder = document.getElementById("entryHolder");
    let inst = document.getElementById("instructions");
    let rap = document.getElementById("refreshAllParagraph");
    let slc = document.getElementById("saveLoadControls");
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

function refreshFrame(e, n) {
    e.preventDefault();
    let ctr = document.getElementById(`screenContainer${n}`);
    let ifr = ctr.querySelector("iframe");
    ifr.parentNode.replaceChild(ifr.cloneNode(), ifr);

}

function refreshAll(e) {
    let alliFrs = document.querySelectorAll("iframe");
    for (ifr of alliFrs) {
        ifr.parentNode.replaceChild(ifr.cloneNode(), ifr);
    }
}

function saveList(event) {
    let listName = document.getElementById("saveListName").value;
    let URLs = document.getElementById("urls").innerText;
    let names = document.getElementById("names").innerText;

    localStorage.setItem("replit-list-" + listName,
        JSON.stringify({
            urls: URLs,
            names: names,
        }));
    fillSelectBox();
}

function loadList(event) {
    let urls = document.getElementById("urls");
    let names = document.getElementById("names");
    let listName = document.getElementById("loadListName").value;
    if (urls.innerText !== "" || names.innerText !== "") {
        let ret = confirm(`Are you sure you want to load list ${listName}? This will overwrite the current names and URLs.`);
        if (ret == false) {
            return;
        }
    }

    let item = JSON.parse(localStorage.getItem("replit-list-" + listName));
    document.getElementById("urls").innerText = item.urls;
    document.getElementById("names").innerText = item.names;
    updateNames();
    updateURLs();
}

function deleteList(event) {
    let urls = document.getElementById("urls");
    let names = document.getElementById("names");
    let listName = document.getElementById("loadListName").value;
    let ret = confirm(`Are you sure you want to delete the list ${listName}?`);
    if (ret === true) {
        localStorage.removeItem("replit-list-" + listName);
        fillSelectBox();
    }
}

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

function fillSelectBox() {
    let sel = document.getElementById("loadListName");
    sel.innerHTML = "";
    Object.keys(localStorage).forEach(key => {
        if (key.substring(0, 12) === "replit-list-") {
            let name = key.substring(12);
            sel.insertAdjacentHTML("beforeend",
                `<option value="${name}">${name}</option>`);
        }
    });

}