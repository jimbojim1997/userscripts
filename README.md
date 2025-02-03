# Browser User Scripts

A collection of browser userscipts for various websites.

These have been tested in [Tampermonkey](https://www.tampermonkey.net/) ([Chome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089), [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)), though they should work in an Greasemonkey compatible userscript addin.

## All Sites

### Show Word Definition [[Source](Show%20Word%20Definition.user.js)] [[Install](Show%20Word%20Definition.user.js?raw=1)]

When a word is selected a book icon is displayed beneith, when clicked the definition of the word is displayed. The definitions are retreived fom [dictionaryapi.dev](https://dictionaryapi.dev/).

## Stack Exchange

### Stack Overflow

#### Return Homepage Hot Questions [[Source](Stack%20Overflow%20-%20return%20homepage%20hot%20questsions.user.js)] [[Install](Stack%20Overflow%20-%20return%20homepage%20hot%20questsions.user.js?raw=1)]

Adds Stack Exchange hot questsions back to the Stack Overflow home page; they're placed at the bottom of the panel containing the _Featured On Meata_ and _Hot Meta Posts_. A recent redisgn removed this from the homepage, though they do remain on the questions pages. The questsions are retreived from [Stack Exchange hot questsions feed](https://stackexchange.com/feeds/questions), to my knowledge there isn't an API to get the hot questsions displayed on the question pages so there will be a difference in content. The hot questsions are cached for one hour.

### Code Golf

#### Order By Bytes [[Source](Code%20Golf%20-%20order%20by%20bytes.user.js)] [[Install](Code%20Golf%20-%20order%20by%20bytes.user.js?raw=1)]

Adds two options to the _Sorted by_ droplist to order the answers by how many bytes are used in the solution.
