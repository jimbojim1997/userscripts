// ==UserScript==
// @name         Stack Exchange: Highlight comment names
// @namespace    jimbojim1997
// @version      2025-05-26
// @description  try to take over the world!
// @author       jimbojim1997
// @match        https://stackexchange.com/questions/*
// @match        https://*.stackexchange.com/questions/*
// @match        https://stackoverflow.com/questions/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @run-at       document-body
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const commentProcessedClass = "sehcn-processed";
    const commentUserLinkClass = "sehcn-user-link";
    const commentNoTransitionClass = "sehcn-no-background-transition";

    GM_addStyle(`
        .${commentUserLinkClass} {text-decoration: underline; cursor: help;}
        .${commentNoTransitionClass} :is(.comment-actions, .comment-text) {transition: none !important;}
    `);

    const observer = new MutationObserver(onMutation);
    const observationTarget = document.body;
    const observationOptions = {
        subtree: true,
        childList: true
    };

    observer.observe(observationTarget, observationOptions);

    function onMutation(mutations) {
        try {
            observer.disconnect();

            for (const mutation of mutations) {
                const comments = getChildComments(mutation.target);
                for (const comment of comments) {
                    addCommentUserHighlight(comment);
                }
            }

        }
        finally {
            observer.observe(observationTarget, observationOptions);
        }
    }

    function getChildComments(target) {
        const selector = `.comment-copy:not(.${commentProcessedClass})`;
        if (target.matches(selector)) return [target];
        else return target.querySelectorAll(selector);
    }

    function addCommentUserHighlight(commentNode) {
        commentNode.classList.add(commentProcessedClass);
        commentNode.innerHTML = commentNode.innerHTML.replace(/@[^\s]{3,}/, `<span class="${commentUserLinkClass}">$&</span>`);

        const userLinks = commentNode.querySelectorAll(`.${commentUserLinkClass}`);
        for (const link of userLinks) {
            link.addEventListener("mouseenter", onUserLinkMouseEnter);
            link.addEventListener("mouseleave", onUserLinkMouseLeave);
        }
    }

    function onUserLinkMouseEnter(event) {
        const comments = [...event.target.closest(".comments-list").querySelectorAll(".comment")].map(c => ({
            u: c.querySelector(".comment-user").innerText.toLowerCase().replace(/\s/g, ""),
            c: c
        }));

        const find = event.target.innerText.match(/@(.*)/)[1].toLowerCase();

        for (const comment of comments) {
            if (comment.u.startsWith(find)) {
                comment.c.classList.add("comment__highlight");
            }
        }
    }

    function onUserLinkMouseLeave(event) {
        const comments = event.target.closest(".comments-list").querySelectorAll(".comment");
        for (const comment of comments) {
            comment.classList.remove("comment__highlight");
            comment.classList.add(commentNoTransitionClass);
            setTimeout(() => comment.classList.remove(commentNoTransitionClass), 0);
        }
    }
})();