

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
                <p class="screenTitle" id="title${i + 1}">${names[i]}</p>
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
                container.innerHTML = (` <p class="screenTitle" id="title${i + 1}">${name}</p>`)
            }
        } else {

            outerContainer.insertAdjacentHTML("beforeend", `
            <div class="studentScreen" id="screenContainer${i + 1}">
                <p class="screenTitle" id="title${i + 1}">${names[i]}</p>
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
    var showHide = document.getElementById("showHide");
    var entryHolder = document.getElementById("entryHolder");
    var inst = document.getElementById("instructions");
    if (showHide.innerText === "—") {

        entryHolder.style.display = "none";
        inst.style.display = "none";
        showHide.innerText = "+";
    } else {
        entryHolder.style.display = "flex";
        inst.style.display = "block";
        showHide.innerText = "—";
    }
}