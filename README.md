# Browser User Scripts

A collection of browser userscipts for various websites.

These have been tested in [Tampermonkey](https://www.tampermonkey.net/) ([Chome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089), [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)), though they should work in an Greasemonkey compatible userscript addin.

## All Sites

### Show Word Definition [[Source](https://github.com/jimbojim1997/userscripts/blob/main/Show%20Word%20Definition.user.js)] [[Install](https://github.com/jimbojim1997/userscripts/raw/refs/heads/main/Show%20Word%20Definition.user.js)]

When a word is selected a book icon is displayed beneith, when clicked the definition of the word is displayed. The definitions are retreived fom [dictionaryapi.dev](https://dictionaryapi.dev/).

## BBC Good Food

### Screen Wake Lock [[Source](https://github.com/jimbojim1997/userscripts/blob/main/BBC%20Good%20Food%20-%20Screen%20Wake%20Lock.user.js)] [[Install](https://github.com/jimbojim1997/userscripts/raw/refs/heads/main/BBC%20Good%20Food%20-%20Screen%20Wake%20Lock.user.js)]

Keep the screen awake when viewing a recipe. A checkbox is added below the *Save to My Food* button, when checked the screen will remain awake as long as the recipe tab is visible.

## Stack Exchange

#### Stack Exchange: Highlight comment names [[Source](https://github.com/jimbojim1997/userscripts/blob/main/Stack%20Exchange%20-%20highlight%20comment%20names.user.js)] [[Install](https://github.com/jimbojim1997/userscripts/raw/refs/heads/main/Stack%20Exchange%20-%20highlight%20comment%20names.user.js)]

When a user is @mentioned in a comment, hover over their user name to highlight their other comments in the thread.

### Stack Overflow

#### Return Homepage Hot Questions [[Source](https://github.com/jimbojim1997/userscripts/blob/main/Stack%20Overflow%20-%20return%20homepage%20hot%20questsions.user.js)] [[Install](https://github.com/jimbojim1997/userscripts/raw/refs/heads/main/Stack%20Overflow%20-%20return%20homepage%20hot%20questsions.user.js)]

Adds Stack Exchange hot questsions back to the Stack Overflow home page; they're placed at the bottom of the panel containing the _Featured On Meata_ and _Hot Meta Posts_. A recent redisgn removed this from the homepage, though they do remain on the questions pages. The questsions are retreived from [Stack Exchange hot questsions feed](https://stackexchange.com/feeds/questions), to my knowledge there isn't an API to get the hot questsions displayed on the question pages so there will be a difference in content. The hot questsions are cached for one hour.

### Code Golf

#### Order By Bytes [[Source](https://github.com/jimbojim1997/userscripts/blob/main/Code%20Golf%20-%20order%20by%20bytes.user.js)] [[Install](https://github.com/jimbojim1997/userscripts/raw/refs/heads/main/Code%20Golf%20-%20order%20by%20bytes.user.js)]

Adds two options to the _Sorted by_ droplist to order the answers by how many bytes are used in the solution.

## Travelling Man

### Products In Series [[Source](https://github.com/jimbojim1997/userscripts/blob/main/Travelling%20Man%20-%20Products%20In%20Series.user.js)] [[Install](https://github.com/jimbojim1997/userscripts/raw/refs/heads/main/Travelling%20Man%20-%20Products%20In%20Series.user.js)]

Adds a *Products In Series* section to book product pages which contains all other volumes of the current book.
