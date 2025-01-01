// ==UserScript==
// @name         Stack Overflow: Return Homepage Hot Questsions
// @namespace    jimbojim1997
// @version      2024-12-19
// @description  Add the Stack Exchange hot questsions back to the Stack Overflow home page.
// @author       jimbojim1997
// @match        https://stackoverflow.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      stackexchange.com
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';

    //Start Configuration

    const maxCacheAgeMs = 1000 * 60 * 60;

    //End Configuration

    const hotQuestionsPromise = getHotQuestionsAsync();
    const widget = await elementCreatedAsync("#sidebar > .s-sidebarwidget:nth-child(2)");
    const hotQuestions = await hotQuestionsPromise;
    if (hotQuestions) addHotQuestsionsToPage(hotQuestions.entries, widget);

    async function getHotQuestionsAsync() {
        const nowMs = new Date().getTime();
        const cacheDateMs = GM_getValue("cacheDateMs");
        if (cacheDateMs && nowMs - maxCacheAgeMs < cacheDateMs) return Promise.resolve(GM_getValue("hotQuestions"));

        return httpRequestAsync({
            method: "GET",
            url: "https://stackexchange.com/feeds/questions"
        }).then(r => parseHotQuestionsAtom(r.responseXML)).then(hq => {
            hq.entries.sort(compareDesc(e => e.rank));
            GM_setValue("cacheDateMs", nowMs);
            GM_setValue("hotQuestions", hq);
            return hq;
        });
    }

    function addHotQuestsionsToPage(questions, container) {
        if (!questions || questions.length === 0) return;

        const sectionTitle = document.createElement("div");
        sectionTitle.innerText = "Hot Questions";
        sectionTitle.className = "s-sidebarwidget--header";
        container.appendChild(sectionTitle);

        const ul = document.createElement("ul");
        ul.className = "ml0";
        container.appendChild(ul);

        for (const entry of questions) {
            const url = new URL(entry.url);

            const li = document.createElement("li");
            li.className = "s-sidebarwidget--item d-flex px16";
            ul.appendChild(li);

            const faviconContainer = document.createElement("a");
            faviconContainer.className = "flex--item1 fl-shrink0";
            faviconContainer.href = `${url.protocol}//${url.host}`;
            li.appendChild(faviconContainer);

            const favicon = document.createElement("div");
            favicon.className = `favicon ${entry.favicon}`;
            faviconContainer.appendChild(favicon);

            const linkContainer = document.createElement("div");
            linkContainer.className = "flex--item wmn0 ow-break-word";
            li.appendChild(linkContainer);

            const link = document.createElement("a");
            link.className = "fc-black-600";
            link.innerText = entry.title;
            link.href = url.toString();
            linkContainer.appendChild(link);
        }
    }

    function parseHotQuestionsAtom(xml) {
        const feed = xml.querySelector(":scope");
        return {
            entries: Array.from(feed.querySelectorAll(":scope > entry")).map(e => {
                const url = e.querySelector(":scope > link").getAttribute("href");
                return {
                    title: e.querySelector(":scope > title").textContent.match(/^(.*?)( \u2013|$)/)[1],
                    rank: parseInt(e.querySelector(":scope > rank").textContent),
                    url: url,
                    favicon: getFaviconName(url)
                };
            })
        };
    }

    function getFaviconName(url) {
        const match = url.match(/^https:\/\/(.+?)\.(.+?)(\.|\/|$)/i);
        if (match[1] === "meta") return `favicon-${match[2]}${match[1]}`;
        else return `favicon-${match[1]}`;
    }

    async function elementCreatedAsync(selector, scope = null) {
        if (!scope) scope = document;

        return new Promise((resolve, reject) => {
            const el = scope.querySelector(selector);
            if (el) return resolve(el);

            const obs = new MutationObserver((changes, observer) => {
                const el = scope.querySelector(selector);
                if (el) {
                    obs.disconnect();
                    return resolve(el);
                }
            });

            obs.observe(scope, {childList: true, subtree: true});
        });
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

    function parseDate(text) {
        if (!text) return null;
        return new Date(text);
    }

    function compareDesc(selector) {
        return (a, b) => selector(b) - selector(a);
    }
})();