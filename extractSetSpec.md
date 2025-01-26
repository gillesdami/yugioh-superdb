# extractSetSpec.md

The cardsets can be found at the following url: https://www.db.yugioh-card.com/yugiohdb/card_list.action?wname=CardSearch&request_locale=LOC
Cardset exists for the locales ['en', 'fr', 'ja', 'de', 'ae', 'cn', 'es', 'it', 'ko', 'pt'].

The cardset names can be found by running: [...document.querySelectorAll('.pack > p > strong')].map(strong => strong.textContent.trim())
The cardset urls can be found by running: [...document.querySelectorAll('input.link_value')].map(input => input.value)

By following the cardset url we can get each card rarity and id

rarities = [...document.querySelectorAll('.lr_icon > p')].map(p => p.textContent.trim())
card_id = [...document.querySelectorAll('input.link_value')].map(input => input.value.match(/cid=(\d+)/)[1])

The edition.card_number will be filled at a later time, an empty string should be provided in meanwhile.
