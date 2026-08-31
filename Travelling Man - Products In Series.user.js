// ==UserScript==
// @name         Travelling Man - Products In Series
// @namespace    jimbojim1997
// @version      2026-08-31
// @description  Adds a section to the product page showing the other products in the current series.
// @author       jimbojim1997
// @match        https://travellingman.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=travellingman.com
// @run-at       document-end
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    const titleParts = getProductTitleParts();
    if (!titleParts) return;

    const searchTerm = `${titleParts.title} ${titleParts.suffix}`.trimEnd();
    const searchResults = await searchProduct(searchTerm);
    const filteredResults = filterResults(titleParts, searchResults);
    if (!(filteredResults?.length > 0)) return;
    addProductsInSeriesSection(filteredResults, titleParts.volume);

    function getProductTitleParts() {
        const titleContainer = document.querySelector(".product-single .product-single__title");
        if (!titleContainer) return;

        const titleMatch = (/^(?<title>.*?) *vol(?:ume)? ?(?<volume>\d+) *(?<suffix>.*)$/i).exec(titleContainer.innerText);
        if (!titleMatch) return;

        return {
            title: titleMatch.groups.title,
            volume: titleMatch.groups.volume,
            suffix: titleMatch.groups.suffix
        };
    }

    async function searchProduct(search) {
        const url = new URL("https://search.salesfire.co.uk");
        url.searchParams.set("site-uuid", "bd6f2157-3c13-4293-b6f9-3512ecac6cce");
        url.searchParams.set("q", search);
        url.searchParams.set("per_page", 100);

        let results = [];
        for (let i = 1; true; i++) {
            url.searchParams.set("page", i);

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    accept: "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                results = results.concat(data.results);
                if ( data.results.length === 0 || results.length >= data.totalResults) break;
            } else {
                break;
            }
        }

        return results.map(r => {
            const doc = r.document;
            let productUrl = null;
            let imageUrl = null;
            let originalPrice = null;
            let currentPrice = null;

            if (doc.variants?.length > 0) {
                const variant = doc.variants[0];
                productUrl = variant.link;
                imageUrl = variant.image_url;
                originalPrice = variant.original_price;
                currentPrice = variant.price;
            }

            const volumeMatch = /vol(?:ume) *(?<volume>\d+)?/i.exec(doc.title);

            return {
                title: doc.title,
                volume: volumeMatch ? parseInt(volumeMatch.groups.volume) : null,
                productUrl,
                imageUrl,
                originalPrice,
                currentPrice
            };
        });
    }

    function filterResults(titleParts, searchResults) {
        const prefix = RegExp.escape(titleParts.title);
        const suffix = titleParts.suffix?.length > 0 ? ` *${RegExp.escape(titleParts.suffix)}` : "";
        const titleRegex = new RegExp(`^${prefix} *vol(?:ume)? \\d+${suffix}$`, "i");

        return searchResults.filter(r => r.volume && titleRegex.test(r.title)).sort(buildSortNumericAsc(r => r.volume));
    }

    function addProductsInSeriesSection(products, currentVolume) {
        const recommendationsDiv = document.querySelector("#shopify-section-product-recommendations");
        if (!recommendationsDiv) return;

        const sectionRoot = document.createElement("div");
        sectionRoot.className = "shopify-section";

        const pageWidthDiv = document.createElement("div");
        pageWidthDiv.className = "page-width";
        sectionRoot.append(pageWidthDiv);

        const sectionInnerDiv = document.createElement("div");
        sectionInnerDiv.className = "product-recommendations__inner";
        pageWidthDiv.append(sectionInnerDiv);

        {
            const headerDiv = document.createElement("div");
            headerDiv.className = "section-header text-center";
            sectionInnerDiv.append(headerDiv);

            const heading = document.createElement("h2");
            heading.innerText = "Products In Series";
            headerDiv.append(heading);
        }

        const productsUl = document.createElement("ul");
        productsUl.className = "grid grid--uniform grid--view-items";
        sectionInnerDiv.append(productsUl);

        for (const product of products) {
            const isCurrentVolume = product.volume == currentVolume;

            console.log("tmsl", product);
            const productLi = document.createElement("li");
            productLi.className = "grid__item small--one-half medium-up--one-quarter";
            productsUl.append(productLi);

            const productCard = document.createElement("div");
            productCard.className = "grid-view-item product-card";
            productLi.append(productCard);

            {
                const coverLink = document.createElement("a");
                coverLink.className = "grid-view-item__link grid-view-item__image-container full-width-link";
                coverLink.href = product.productUrl;
                productCard.append(coverLink);

                const hiddenText = document.createElement("span");
                hiddenText.className = "visually-hidden";
                hiddenText.innerText = product.title;
                coverLink.append(hiddenText);

                if (isCurrentVolume) {
                    coverLink.style.backgroundColor = "#ffffffa0";
                    coverLink.style.display = "flex";
                    coverLink.style.alignItems = "center";
                    coverLink.style.justifyContent = "center";

                    const span = document.createElement("span");
                    span.style.backgroundColor = "#ffffff";
                    span.style.borderRadius = "20px";
                    span.style.padding = ".1em .3em";
                    span.style.fontWeight = "700";
                    span.style.fontSize = "1.26667em";
                    span.innerText = "Current Volume";
                    coverLink.append(span);
                }
            }

            {
                const imageWrapper1 = document.createElement("div");
                imageWrapper1.className = "product-card__image-with-placeholder-wrapper";
                productCard.append(imageWrapper1);

                const imageWrapper2 = document.createElement("div");
                imageWrapper2.className = "grid-view-item__image-wrapper product-card__image-wrapper";
                imageWrapper1.append(imageWrapper2);

                const imageWrapper3 = document.createElement("div");
                imageWrapper3.style.paddingTop = "142.5%";
                imageWrapper2.append(imageWrapper3);

                const image = document.createElement("img");
                image.className = "grid-view-item__image";
                image.alt = product.title;
                image.src = product.imageUrl;
                imageWrapper3.append(image);
            }

            {
                const titleDiv = document.createElement("div");
                titleDiv.className = "h4 grid-view-item__title product-card__title";
                titleDiv.innerText = product.title;
                productCard.append(titleDiv);
            }

            {
                const priceContainer = document.createElement("dl");
                priceContainer.className = "price";
                productCard.append(priceContainer);

                if (product.originalPrice && product.originalPrice !== product.currentPrice) {
                    priceContainer.classList.add("price--on-sale");

                    const outerDiv = document.createElement("div");
                    outerDiv.className = "price__sale";
                    priceContainer.append(outerDiv);

                    {
                        const dt = document.createElement("dt");
                        outerDiv.append(dt);

                        const span = document.createElement("span");
                        span.className = "visually-hidden visually-hidden--inline";
                        span.innerText = "Regular price";
                        dt.append(span);
                    }

                    {
                        const dd = document.createElement("dd");
                        outerDiv.append(dd);

                        const span = document.createElement("span");
                        span.className = "price-item price-item--regular";
                        span.innerText = `£${product.originalPrice}`;
                        dd.append(span);
                    }

                    {
                        const dt = document.createElement("dt");
                        outerDiv.append(dt);

                        const span = document.createElement("span");
                        span.className = "visually-hidden visually-hidden--inline";
                        span.innerText = "Sale price";
                        dt.append(span);
                    }

                    {
                        const dd = document.createElement("dd");
                        outerDiv.append(dd);

                        const span = document.createElement("span");
                        span.className = "price-item price-item--sale";
                        span.innerText = `£${product.currentPrice}`;
                        dd.append(span);
                    }
                } else {
                    const outerDiv = document.createElement("div");
                    outerDiv.className = "price__regular";
                    priceContainer.append(outerDiv);

                    {
                        const dt = document.createElement("dt");
                        outerDiv.append(dt);

                        const span = document.createElement("span");
                        span.className = "visually-hidden visually-hidden--inline";
                        span.innerText = "Regular price";
                        dt.append(span);
                    }

                    {
                        const dd = document.createElement("dd");
                        outerDiv.append(dd);

                        const span = document.createElement("span");
                        span.className = "price-item price-item--regular";
                        span.innerText = `£${product.currentPrice}`;
                        dd.append(span);
                    }
                }
            }
        }

        recommendationsDiv.before(sectionRoot);
    }

    function buildSortNumericAsc(valueSelector) {
        return (a, b) => valueSelector(a) - valueSelector(b);
    }
})();
