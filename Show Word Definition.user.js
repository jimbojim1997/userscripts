// ==UserScript==
// @name         Show Word Definition
// @namespace    jimbojim1997
// @version      2025-01-30
// @description  Show the definition of the selected word.
// @author       jimbojim1997
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @connect      dictionaryapi.dev
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const CUSTOM_ELEMENT = "ab17cfcf-8297-4c22-b9ad-f98ec4ca603c";

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("click", onAnyClick);
    window.addEventListener("resize", onResize);

    function onSelectionChange(event) {
        for (const el of document.querySelectorAll(`${CUSTOM_ELEMENT}:not([open])`)) el.parentElement.removeChild(el);

        const selection = window.getSelection();
        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            if (range.startOffset === range.endOffset) continue;

            const popup = document.createElement(CUSTOM_ELEMENT);
            popup.range = range;
            document.body.appendChild(popup);
        }
    }

    function onAnyClick(e) {
        if (!e.target.matches(CUSTOM_ELEMENT)) {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) {
                for (const el of document.querySelectorAll(CUSTOM_ELEMENT)) el.parentElement.removeChild(el);
            } else if (selection.rangeCount === 1) {
                const range = selection.getRangeAt(0);
                if (range.startOffset === range.endOffset) {
                    for (const el of document.querySelectorAll(CUSTOM_ELEMENT)) el.parentElement.removeChild(el);
                }

            }
        }
    }

    function onResize(e) {
        for (const el of document.querySelectorAll(CUSTOM_ELEMENT)) el.reposition();
    }

    customElements.define(CUSTOM_ELEMENT, class extends HTMLElement {
        #range = null;
        #root = null;

        constructor() {
            super();
        }

        #populateWordInfo(wordInfo) {
            const popup = this.#root.getElementById("popup");
            popup.removeAttribute("hidden");

            popup.querySelector("#word").innerText = wordInfo.word;

            const phonetic = wordInfo.phonetics?.length > 0 ? wordInfo.phonetics[0].text : wordInfo.phonetic;
            if (phonetic) popup.querySelector("#phonetic").innerText = phonetic;

            const meaningList = popup.querySelector("#meanings");
            for (const meaning of wordInfo.meanings) {
                for (const definition of meaning.definitions) {
                    const li = document.createElement("li");
                    meaningList.appendChild(li);

                    const part = document.createElement("span");
                    part.className = "part-of-speech";
                    part.innerText = meaning.partOfSpeech;
                    li.appendChild(part);
                    li.appendChild(document.createTextNode(": "));
                    li.appendChild(document.createTextNode(definition.definition));
                }
            }
            this.reposition();
        };

        async #onShowDefinitionClick(e) {
            this.setAttribute("open", "");
            const showDefinition = this.#root.getElementById("show-definition");
            showDefinition.style.cursor = "wait";

            const query = this.#range.toString().trim();
            const response = await httpRequestAsync({
                method: "GET",
                url: `https://api.dictionaryapi.dev/api/v2/entries/en/${query}`
            });
            showDefinition.setAttribute("hidden", "");

            const data = JSON.parse(response.responseText);
            if (data instanceof Array) {
                const wordInfo = data[0];
                this.#populateWordInfo(wordInfo);
            } else {
                this.#root.getElementById("unknown").removeAttribute("hidden");
            }
        }

        connectedCallback() {
            if (this.#root) return;
            const root = this.#root = this.attachShadow({mode: "closed"});
            root.innerHTML = `
<style>
:host {display: block; position: absolute; font-size: 15px; transform: translate(-50%, 0); max-width: 90vw;}
[hidden] {display: none !important;}
#show-definition {background: none; border: none; padding: 0; margin: 0; cursor: pointer; font-size: 20px; z-index: 1005;}
#unknown { background: none; border: none; color: red; padding: 0; margin: 0; font-size: 20px; z-index: 1005;}
#popup {display: flex; flex-flow: column nowrap; align-items: center; z-index: 1000; font-size: 1em; }
#popup-arrow {background: #16C60C; width: 20px; height: 20px; transform: translate(0, 10px) rotate(45deg); z-index: 1001;}
#popup-content {border: 2px solid #16C60C; border-radius: 5px; background: white; color: black; padding: 5px; z-index: 1002; }
#heading {font-weight: normal; font-size: 1.2em; margin: 0;}
#word {font-weight: bold; margin-right: 0.5em;}
#phonetic {}
#meanings {padding-left: 1em; margin: 0;}
.part-of-speech {font-style: italic;}
</style>
<button id="show-definition">📗</button>
<div id="unknown" hidden>⁉</div>
<div id="popup" hidden>
<div id="popup-arrow"></div>
<div id="popup-content">
<h1 id="heading"><span id="word"></span> <span id="phonetic"></span></h1>
<ul id="meanings"></ul>
</div>
</div>
            `;

            const showDefinition = root.getElementById("show-definition");
            showDefinition.addEventListener("click", this.#onShowDefinitionClick.bind(this));
        }

        reposition() {
            const bounds = this.#range.getBoundingClientRect();
            this.style.top = `${window.scrollY + bounds.bottom}px`;
            this.style.left = `${window.scrollX + (bounds.left + bounds.right) / 2}px`;
        }

        set range(value) {
            this.#range = value;
            this.reposition();
        }

        get range() {
            return this.#range;
        }
    });

    async function httpRequestAsync(options) {
        return new Promise((resolve, reject) => {
            options.onload = resolve;
            options.onabort = reject;
            options.onerror = reject;
            options.ontimeout = reject;
            GM_xmlhttpRequest(options);
        });
    };
})();