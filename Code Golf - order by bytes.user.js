// ==UserScript==
// @name         Code Golf Order By Bytes
// @namespace    jimbojim1997
// @version      2025-02-03
// @description  Order code golf answers by the byes used in the solution.
// @author       jimbojim1997
// @match        https://codegolf.stackexchange.com/questions/*
// @icon         https://www.google.com/s2/favicons?sz=64&codegolf.stackexchange.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const orderDropList = document.querySelector("#answers-header select");
    if (!orderDropList) return;

    orderDropList.options.add(new Option("Bytes (least first)", "blf"));
    orderDropList.options.add(new Option("Bytes (most first)", "bmf"));

    orderDropList.addEventListener("change", onOrderDropListChange, {capture: true});

    function onOrderDropListChange(e) {
        const value = e.target.value;
        if (value === "blf" || value === "bmf") {
            e.stopPropagation();
            const comparer = getSortComparer(value);
            sortAnswers(comparer);
        }
    }

    function getSortComparer(value) {
        if (value === "blf") {
            return (a, b) => a.bytes - b.bytes;
        } else if (value === "bmf") {
            return (a, b) => b.bytes - a.bytes;
        } else {
            throw new Error(`Unknown value: ${value}`);
        }
    }

    function sortAnswers(comparer) {
        const answers = Array.from(document.querySelectorAll("#answers .answer"))
                             .map(el => ({ans: el, link: el.previousElementSibling, bytes: getAnswerBytesUsed(el)}))
                             .sort(comparer);

        const frag = document.createDocumentFragment();
        for (const ans of answers) {
            frag.appendChild(ans.link);
            frag.appendChild(ans.ans);
        }

        document.querySelector("#answers-header").after(frag);
    }

    function getAnswerBytesUsed(el) {
        const match = el.innerText.match(/(\d+)\s+bytes?/i);
        return match ? parseInt(match[1]) : Number.MAX_SAFE_INTEGER;
    }
})();