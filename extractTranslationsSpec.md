# extract translations from yugiohdb

By navigating to `https://www.db.yugioh-card.com/yugiohdb/card_search.action?wname=CardSearch&request_locale=LOC` where LOC is one of "en", "fr", "ja", "de", "ae", "cn", "es", "it", "ko", "pt". And then executing extractTranslation you can get the translations for map for each language.

Create a script that inherit base-scrapper to extract the translations and write them to a json file. And another script to run it from the cli.

```js
function extractTranslation () {
    const extractor = (...cats) => cats.flatMap(cat => [...document.querySelector(cat).querySelectorAll('li')])
        .map(li => ([li.querySelector('input').value, li.innerText.trim()]))
        .reduce((acc, val) => { acc[val[0]] = val[1]; return acc; }, {});

    return {
        attribute: extractor('#filter_attribute', '#filter_effect_set'),
        monster_type: extractor('#filter_specis'),
        type: extractor('#filter_other'),
    };
}
```

Additionally please include those traductions to the one extracted.

```json
{
    "Trap": {
        "ja": "罠",
        "ko": "함정",
        "ea": "Trap",
        "en": "Trap",
        "de": "Fallen",
        "fr": "Piège",
        "it": "Trappola",
        "es": "Trampa",
        "pt": "Justo"
    }
    "Spell": {
        "ja": "魔法",
        "ko": "마법",
        "ea": "Spell",
        "en": "Spell",
        "de": "Zauber",
        "fr": "Magie",
        "it": "Magia",
        "es": "Mágica",
        "pt": "Magia"
    }
}
```
