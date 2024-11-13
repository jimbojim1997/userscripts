// ==UserScript==
// @name         Show Word Definition
// @namespace    jimbojim1997
// @version      2024-11-11
// @description  Show the definition of the selected word.
// @author       jimbojim1997
// @match        https://*/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      dictionaryapi.dev
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
    .swdd-show-definition-button {position: absolute; background: transparent; border: none; padding: 0; margin: 0; transform: translate(-50%, 0); cursor: pointer; font-size: 20px; z-index: 1005;}
    .swdd-popup {position: absolute; transform: translate(-50%, 0); display: flex; flex-flow: column nowrap; align-items: center; z-index: 1000; font-size: 1em; max-width: min(50em, 90vw);}
    .swdd-popup-arrow {background: #16C60C; width: 20px; height: 20px; transform: translate(0, 10px) rotate(45deg); z-index: 1001;}
    .swdd-popup-content {border: 2px solid #16C60C; border-radius: 5px; background: white; color: black; overflow: hidden; padding: 5px; z-index: 1002;}
    .swdd-definition-container {display: flex; flex-flow: column nowrap;}

    .sswd-word-text {font-weight: bold; margin-right: 1em;}
    .sswd-word-phonetic {}
    .sswd-word-meanings {padding-left: 1em;}
    .sswd-word-meaning-part {font-style: italic;}
    `);

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("click", onAnyClick);

    function onSelectionChange(event) {
        for (const el of document.querySelectorAll(".swdd-show-definition-button")) el.parentElement.removeChild(el);

        const selection = window.getSelection();
        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            if (range.startOffset === range.endOffset) continue;

            const bounds = range.getBoundingClientRect();
            const button = document.createElement("button");
            button.className = "swdd-show-definition-button";
            button.innerText = "📗";
            button.style.top = `${window.scrollY + bounds.bottom}px`;
            button.style.left = `${window.scrollX + (bounds.left + bounds.right) / 2}px`;
            button.addEventListener("click", e => onDefinitionButtonClick(e, range));
            document.body.appendChild(button);
        }
    }

    function onAnyClick(event) {
        if (!event.target.closest(".swdd-popup, .swdd-show-definition-button")) {
            for (const el of document.querySelectorAll(".swdd-popup")) el.parentElement.removeChild(el);
        }
    }

    async function onDefinitionButtonClick(event, range) {
        const text = range.toString().trim();
        const response = await httpRequestAsync({
            method: "GET",
            url: `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`
        });

        const [popup, popupContent] = createPopup();
        document.body.appendChild(popup);
        {
            const bounds = range.getBoundingClientRect();
            popup.style.top = `${window.scrollY + bounds.bottom}px`;
            popup.style.left = `${window.scrollX + (bounds.left + bounds.right) / 2}px`;
        }

        const data = JSON.parse(response.responseText);
        if (data instanceof Array) {
            const content = createDefinitionContent(data[0]);
            popupContent.appendChild(content);
        } else if (data instanceof Object) {
            popupContent.innerText = data.title;
        }

        {
            const bounds = popupContent.getBoundingClientRect();
            if (bounds.left < 0) popupContent.style.transform = `translateX(${Math.abs(bounds.left)}px)`;
            else if (bounds.right > document.body.clientWidth) popupContent.style.transform = `translateX(${bounds.right - document.body.clientWidth}px)`;
        }

        event.target.parentElement.removeChild(event.target);
    }

    function createPopup() {
        const container = document.createElement("div");
        container.className = "swdd-popup";

        const arrow = document.createElement("div");
        arrow.className = "swdd-popup-arrow";
        container.appendChild(arrow);

        const inner = document.createElement("div");
        inner.className = "swdd-popup-content";
        container.appendChild(inner);

        return [container, inner];
    }

    function createDefinitionContent(wordInfo) {
        const content = document.createElement("div");
        content.className = "swdd-definition-container";

        {
            const header = document.createElement("div");
            content.appendChild(header);

            const word = document.createElement("span");
            word.className = "sswd-word-text";
            word.innerText = wordInfo.word;
            header.appendChild(word);

            const phonetic = wordInfo.phonetics?.length > 0 ? wordInfo.phonetics[0].text : wordInfo.phonetic;
            if (phonetic) {
                const el = document.createElement("span");
                el.className = "sswd-word-phonetic";
                el.innerText = phonetic;
                header.appendChild(el);
            }
        }

        const meaningsList = document.createElement("ul");
        meaningsList.className = "sswd-word-meanings";
        content.appendChild(meaningsList);

        for (const meaning of wordInfo.meanings) {
            for (const definition of meaning.definitions) {
                const li = document.createElement("li");
                meaningsList.appendChild(li);

                const part = document.createElement("span");
                part.className = "sswd-word-meaning-part";
                part.innerText = `${meaning.partOfSpeech}: `;
                li.appendChild(part);

                const def = document.createElement("span");
                def.innerText = definition.definition;
                li.appendChild(def);
            }
        }
        return content;
    }

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