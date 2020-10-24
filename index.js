let screens = [];

function stripPaste(e) {
    e.preventDefault();
    if (!e.clipboardData) return;
    if (e.clipboardData) {
        text = e.clipboardData.getData('text/plain');
    }
    e.target.innerText = text;
    updateStudents(e);

}

function updateStudents(e) {
    let urls = document.getElementById("urls").innerText.trim().replaceAll(/^\s*$\n?/gm, "").split("\n");
    let names = document.getElementById("names").innerText.trim().replaceAll(/^\s*$\n?/gm, "").split("\n");
    let sel1 = document.getElementById("student1select");
    let sel2 = document.getElementById("student2select");
    if (urls.length < screens.length) screens = screens.slice(0, urls.length);
    let newScreens = {};
    let url = '';
    screenNum = 0;
    for (let i = 0; i < urls.length; i++) {
        try {
            urlParse = new URL(urls[i]);
            if (urlParse.hostname === "repl.it" || urlParse.hostname === "www.repl.it") {
                url = "https://repl.it" + urlParse.pathname + "?lite=true" + urlParse.hash;
            } else {
                url = urls[i];
            }

            let name = names[i] || "Student" + (screenNum + 1);
            if (screens[screenNum] && screens[screenNum].url && screens[screenNum].url === url) {
                // already have this screen set up
                // just update the name
                screens[screenNum].name = name;
            } else if (url !== "") {
                //otherwise, create the iframe
                const placeholder = document.createElement('div');
                placeholder.innerHTML = `<iframe src=${url} class="embed" id="iframe${i} scrolling="no" frameborder="no" allowtransparency="true"
            allowfullscreen="true"
            sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-modals">`;
                let ifr = placeholder.firstElementChild;
                screens[screenNum] = {
                    url: url,
                    name: name,
                    iframe: ifr,
                    screenNum: (screenNum + 1),
                }
                screenNum++;
            }
            updateAllScreens();
        } catch (e) {
            // likely the URL was not a correct URL
            // log it to the console and don't create a screen
            console.log(e);
        }
    }
}

function updateAllScreens() {
    for (screen of screens) {
        let container = document.getElementById(`screenContainer${screen.screenNum}`);
        if (!container) {
            const outerContainer = document.getElementById("container");
            outerContainer.insertAdjacentHTML("beforeend", `
            <div class="studentScreen" id="screenContainer${screen.screenNum}">
            <p class="screenTitle">Screen ${screen.screenNum}</p>
        </div>`)
            container = document.getElementById(`screenContainer${screen.screenNum}`);
        }
        let ifr = container.querySelector(".embed");
        let title = container.querySelector(".screenTitle");
        if (title) {
            title.innerText = screen.name;
        } else {
            container.insertAdjacentHTML("afterbegin", `<p class="screenTitle">${screen.name}</p>`)
        }

        if (ifr) {
            ifr.src = screen.url;
        } else {
            container.insertAdjacentHTML("beforeend", `
                    <iframe class="embed" src="${screen.url}" 
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