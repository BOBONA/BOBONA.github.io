function iosCopyToClipboard(el) {
    var oldContentEditable = el.contentEditable,
        oldReadOnly = el.readOnly,
        range = document.createRange();
    el.contentEditable = true;
    el.readOnly = false;
    range.selectNodeContents(el);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);
    el.setSelectionRange(0, 999999);
    el.contentEditable = oldContentEditable;
    el.readOnly = oldReadOnly;
    document.execCommand('copy');
}

function addData(label, text) {
    let l = document.createElement("p");
    l.textContent = label;
    l.style.fontWeight = "bold";
    let t = document.createElement("textarea");
    t.textContent = text;
    t.readOnly = true;
    t.style.minWidth = "80%";
    t.style.minHeight = "100px";
    t.style.resize = "none";
    t.style.border = "none";
    document.body.appendChild(l);
    document.body.appendChild(t);
}

function generate() {
    const shacharit = document.getElementById("shacharit").checked;
    const morning = document.getElementById("morning").checked;
    const afternoon = document.getElementById("afternoon").checked;
    const night = document.getElementById("night").checked;
    const apartment = document.getElementById("apartment").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    addData("Sign-in link (tap text to copy)", `https://bobona.github.io/migdalphonebox/submit.html` +
    `?where=IN&phones=${JSON.stringify([shacharit, morning, afternoon, night])}&apartment=${apartment}&name=${name}`);
    addData("Sign-out link", `https://bobona.github.io/migdalphonebox/submit.html` +
    `?where=OUT&phones=${JSON.stringify([shacharit, morning, afternoon, night])}&apartment=${apartment}&name=${name}`);
    addData("Script", `// ==UserScript==
// @name         Phone Box Automator
// @namespace    https://stay.app/
// @version      0.1
// @description  Automatically fills out email and submits an attendance Google Form
// @author       Binyamin Friedman
// @match        *://docs.google.com/*/1FAIpQLScTZluOOu2J87HRLBj7FZ_zVqZpZQ8Az9YtEiUaEzlcI3tLjg/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let phones = [true, false, false, false];
    let email = "${email}";
    const times = [
        ["Shacharit", 7, 25],
        ["Morning Seder", 8, 40],
        ["Mincha & Afternoon Seder", 14, 55],
        ["Night Seder & Arvit", 19, 10]
    ];
    function xpath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    window.setTimeout(() => {
    let name = xpath("/html/body/div/div[2]/form/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div[1]/div[1]");
    if (name == null) {
        let emailField = xpath("/html/body/div/div[3]/form/div[2]/div/div[2]/div[1]/div/div[1]/div[2]/div[1]/div/div[1]/input");
        emailField.focus();
        document.execCommand('insertText', false, email);
        window.setTimeout(() => {
        xpath("/html/body/div/div[3]/form/div[2]/div/div[3]/div/div[1]/div/div[2]").click();
        }, 200);
    } else {
        document.forms[0].submit();
    }
    }, 200);
})();`);
}
