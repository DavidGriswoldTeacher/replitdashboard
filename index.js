"use strict";
/* Fill the select box from local storage as soon as the window loads */
window.onload = fillSelectBox;
/* iFrame updating functions */
/**
 * Update all of the frame names. Called when the names box is edited.
 */
function updateNames(e) {
    var names = document.getElementById("names")
        .innerText
        .trim()
        .replace(/^\s*$\n?/gm, "")
        .split("\n");
    for (var i = 0; i < names.length; i++) {
        var container = document.getElementById("screenContainer" + (i + 1));
        if (container) {
            // we have created this screen, just change its name
            var screenTitle = document.getElementById("title" + (i + 1));
            screenTitle.innerText = names[i];
        }
        else {
            // create the screen
            var outerContainer = document.getElementById("container");
            outerContainer.insertAdjacentHTML("beforeend", "\n            <div class=\"studentScreen\" id=\"screenContainer" + (i + 1) + "\">\n                <p class=\"screenTitle\"><span id=\"title" + (i + 1) + "\">" + names[i] + " </span><a href=\"#\" onclick=\"refreshFrame(event, " + (i + 1) + ")\">Refresh</a></p>\n            </div>");
            var container_1 = document.getElementById("screenContainer" + (i + 1));
            container_1.insertAdjacentHTML("beforeend", "<p class=\"error\">You do not yet have a URL for this name.</p>");
        }
    }
}
/**
 * Update all of the frame URLS. Called when the url box is edited.
 */
function updateURLs(e) {
    var urls = document.getElementById("urls")
        .innerText.trim()
        .replace(/^\s*$\n?/gm, "")
        .split("\n");
    var names = document.getElementById("names")
        .innerText
        .trim()
        .replace(/^\s*$\n?/gm, "")
        .split("\n");
    var urlParse;
    var url;
    var outerContainer = document.getElementById("container");
    for (var i = 0; i < urls.length; i++) {
        var name_1 = names[i] || "Student" + (i + 1);
        try {
            urlParse = new URL(urls[i]);
            if (urlParse.hostname === "repl.it" || urlParse.hostname === "www.repl.it") {
                url = "https://repl.it" + urlParse.pathname + "?lite=true" + urlParse.hash;
            }
            else {
                url = urls[i];
            }
        }
        catch (e) {
            url = "";
        }
        var container = document.getElementById("screenContainer" + (i + 1));
        if (container) {
            // we have a screen for this url, lets see if it is correct
            var ifr = container.querySelector("iframe");
            if (ifr && ifr.src === url) {
                continue; //skip to the next run of the loop
            }
            else {
                //since the url is wrong, lets just start over
                container.innerHTML = (" <p class=\"screenTitle\"><span id=\"title" + (i + 1) + "\">" + name_1 + " </span><a href=\"#\" onclick=\"refreshFrame(event, " + (i + 1) + ")\">Refresh</a></p>");
            }
        }
        else {
            outerContainer.insertAdjacentHTML("beforeend", "\n            <div class=\"studentScreen\" id=\"screenContainer" + (i + 1) + "\">\n                <p class=\"screenTitle\"><span id=\"title" + (i + 1) + "\">" + name_1 + " </span><a href=\"#\" onclick=\"refreshFrame(event, " + (i + 1) + ")\">Refresh</a></p>\n            </div>");
            container = document.getElementById("screenContainer" + (i + 1));
        }
        if (url === "") {
            container.insertAdjacentHTML("beforeend", "<p class='error'>The URL for this screen is not valid</p>");
        }
        else {
            container.insertAdjacentHTML("beforeend", "\n                    <iframe class=\"embed\" src=\"" + url + "\" \n                        scrolling=\"no\" \n                        frameborder=\"no\" \n                        allowtransparency=\"true\" \n                        allowfullscreen=\"true\" \n                        sandbox=\"allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-modals\">\n                    </iframe>");
        }
    }
}
/**
 * Refresh a given frame
 * @param n which frame to update?
 */
function refreshFrame(e, n) {
    e.preventDefault();
    var ctr = document.getElementById("screenContainer" + n);
    if (ctr) {
        var ifr = ctr.querySelector("iframe");
        if (ifr) {
            ifr.parentNode
                .replaceChild(ifr.cloneNode(), ifr);
        }
    }
}
/**
 * Refresh all of the frames
 */
function refreshAll(e) {
    var alliFrs = document.querySelectorAll("iframe");
    if (!alliFrs)
        return;
    alliFrs.forEach(function (ifr) {
        ifr.parentNode.replaceChild(ifr.cloneNode(), ifr);
    });
}
/* Interface and storage functions */
/**
 * Shows and hides the control panel
 */
function showHideEntries() {
    var showHide = document.getElementById("showHide");
    var entryHolder = document.getElementById("entryHolder");
    var inst = document.getElementById("instructions");
    var rap = document.getElementById("refreshAllParagraph");
    var slc = document.getElementById("saveLoadControls");
    if (showHide.innerText === "—") {
        entryHolder.style.display = "none";
        inst.style.display = "none";
        showHide.innerText = "+";
        rap.style.writingMode = "vertical-lr";
        slc.style.display = "none";
    }
    else {
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
function saveList(event) {
    var listName = document.getElementById("saveListName").value;
    var URLs = document.getElementById("urls").innerText;
    var names = document.getElementById("names").innerText;
    var current = localStorage.getItem("replit-list-" + listName);
    if (current) {
        var ret = confirm("You already have a list called " + listName + ", are you sure you want to ovewrite it?");
        if (ret === false)
            return;
    }
    localStorage.setItem("replit-list-" + listName, JSON.stringify({
        urls: URLs,
        names: names,
    }));
    fillSelectBox();
}
/** Load a list from local storage */
function loadList(event) {
    var urls = document.getElementById("urls");
    var names = document.getElementById("names");
    var listName = document.getElementById("loadListName").value;
    var saveBox = document.getElementById("saveListName");
    if (urls.innerText !== "" || names.innerText !== "") {
        var ret = confirm("Are you sure you want to load list " + listName + "? This will overwrite the current names and URLs.");
        if (ret == false) {
            return;
        }
    }
    var itemText = localStorage.getItem("replit-list-" + listName);
    var item = JSON.parse(itemText);
    urls.innerText = item.urls;
    names.innerText = item.names;
    saveBox.value = listName;
    updateNames();
    updateURLs();
}
/** Delete a single list from local storage */
function deleteList(event) {
    var urls = document.getElementById("urls");
    var names = document.getElementById("names");
    var listName = document.getElementById("loadListName").value;
    var ret = confirm("Are you sure you want to delete the list " + listName + "?");
    if (ret === true) {
        localStorage.removeItem("replit-list-" + listName);
        fillSelectBox();
    }
}
/** Delete all lists in local storage */
function deleteAll() {
    var ret = confirm("Are you sure you want to delete ALL of your saved lists? This is not reversible!");
    if (ret === false)
        return;
    Object.keys(localStorage).forEach(function (key) {
        if (key.substring(0, 12) === "replit-list-") {
            localStorage.removeItem(key);
        }
    });
    fillSelectBox();
}
/** Looks up lists in local storage and creates the select box options */
function fillSelectBox() {
    var sel = document.getElementById("loadListName");
    sel.innerHTML = "";
    Object.keys(localStorage).forEach(function (key) {
        if (key.substring(0, 12) === "replit-list-") {
            var name_2 = key.substring(12);
            sel.insertAdjacentHTML("beforeend", "<option value=\"" + name_2 + "\">" + name_2 + "</option>");
        }
    });
}
/* UTILITY FUNCTIONS */
/**
 * Strip the HTML from any pasted element so it pastes as plain text
 */
function stripPaste(e) {
    e.preventDefault();
    if (!e.clipboardData)
        return;
    if (e.clipboardData) {
        /** @type {string} */
        var text = e.clipboardData.getData('text/plain');
        document.execCommand('inserttext', false, text + "\n");
        if (e.currentTarget.id === "urls") {
            updateURLs();
        }
        else {
            updateNames();
        }
    }
}
//# sourceMappingURL=index.js.map