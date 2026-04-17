// ==UserScript==
// @name         BBC Good Food - Screen Wake Lock
// @namespace    jimbojim1997
// @version      2026-04-17
// @description  Keep the screen awake when viewing a recipe.
// @author       jimbojim1997
// @match        https://www.bbc.co.uk/food/recipes/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bbc.co.uk
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const keepAwakeConfigKey = "keepAwake";
    GM_addStyle(`
    .bgfsw-checkboxContainer { margin: 12px 0; }
    .bgfsw-checkboxContainer label { display: flex; align-items: center; }
    .bgfsw-checkboxContainer input { width: 2em; aspect-ratio: 1; }
    `);

    const {checkboxContainer, checkbox} = createCheckbox();
    let wakeLock = null;
    setWakeLock();

    const observer = new MutationObserver(onMutation);
    const observeConfig = {
        subtree: true,
        childList: true
    };
    observer.observe(document.body, observeConfig);
    document.addEventListener("visibilitychange", onVisibilityChange);

    function onMutation(mutations) {
        try {
            observer.disconnect();
            if (!checkboxContainer.isConnected) {
                const saveToMyFoodButton = document.querySelector(".ssrcss-rk1su1-ButtonWrapper.ekmlduv0");
                if (saveToMyFoodButton) {
                    saveToMyFoodButton.after(checkboxContainer);
                }
            }
        } finally {
            observer.observe(document.body, observeConfig);
        }
    }

    async function onCheckboxChange(event) {
        await setWakeLock();
        GM_setValue(keepAwakeConfigKey, checkbox.checked);
    }

    async function onWakeLockRelease(event) {
        wakeLock = null;
    }

    async function onVisibilityChange(event) {
        if (document.visibilityState === "visible" && checkbox.checked) {
            await createWakeLock();
        }
    }

    function createCheckbox() {
        const container = document.createElement("div");
        container.className = "bgfsw-checkboxContainer";

        const label = document.createElement("label");
        container.append(label)

        const labelText = document.createElement("span");
        labelText.innerText = "Keep screen awake"
        label.append(labelText);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = GM_getValue(keepAwakeConfigKey, false);
        checkbox.addEventListener("change", onCheckboxChange);
        label.append(checkbox);

        return {checkboxContainer: container, checkbox: checkbox};
    }

    async function setWakeLock(){
        if (checkbox.checked && wakeLock === null) {
            await createWakeLock();
        } else if (!checkbox.checked && wakeLock !== null) {
            await wakeLock.release();
            wakeLock = null;
        }
    }

    async function createWakeLock() {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", onWakeLockRelease);
    }
})();