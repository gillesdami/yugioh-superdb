# Yu-Gi-Oh superdb

The goal is to create a sql light database of data related to yugioh cards by scrapping the website [yugiohdb](https://www.db.yugioh-card.com/yugiohdb).

- The code must be written in js and executed with nodejs.
- The code must allow iterative addition to the resulting data base, so that if data where to be added to the yugiohdb they could be added to the sql database without scrapping the whole site again.

## Automated Daily Updates

This repository includes GitHub Actions automation that:

- ✅ Runs daily at 2:00 AM UTC to sync the database
- ✅ Creates releases when database changes are detected  
- ✅ Sends email notifications for updates, failures, and warnings
- ✅ Includes full logs and database statistics

See `GITHUB_ACTIONS_SETUP.md` for configuration instructions.

## Manual Usage

Run the sync script locally:

```bash
npm start          # Run original sync script
npm run sync       # Run enhanced sync with better logging
node verify-setup.js  # Verify GitHub Actions setup
```

## The model

The tables of the database are defined in `db\genTables.sql`. The database can initially be generated with the script `db\genTables.js`.

## Information on the site to scrap

- yugioh db features the following locales refered as lang in the database: "en", "fr", "ja", "de", "ae", "cn", "es", "it", "ko", "pt".
- yugioh db assign an ID to each card, the first card ID is 4007.
- some cards do not exist in every locales, the db is fully scrapped if for a given id, no pages exist in any of the locales. If a card does not exist in a given local no localization table entry is created for that card locale.
- The url of a card with id `ID` in locale `LOC` is `https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=ID&request_locale=LOC`.
- The table edition exist beceause a card may be edited in multiple cardset and multiple times in a cardset under different rarities. If the rarity of a card cannot be found it is considered as `C` for common.
- Translations for the monsters Attribute, Icon, Monster Type and Card Type can be obtained by scrapping the search form for each locale at `https://www.db.yugioh-card.com/yugiohdb/card_search.action?wname=CardSearch&request_locale=LOC` by replacing LOC by one of the locale.
- Some language may contain monster type that other language does not have, if the monster type exist in english, the english translation should be used in the database else the japanese translation should be used. If an english translation is added later for a monster type in yugiohdb the db should be updated to use that english translation.
- The url `https://www.db.yugioh-card.com/yugiohdb/card_list.action?request_locale=LOC` list the different cardset published for a given locale.
- The url `https://www.db.yugioh-card.com/yugiohdb/forbidden_limited.action?forbiddenLimitedDate=DATE&request_locale=LOC` shows the cards that have limitation at a given date for a given locale, such list is called a banlist.
- The region of a banlist is `TCG` for every locale exept for japanese "ja" which is `OCG`.
- Any error occuring during the execution should be logged, if the error concerns a card, a card set or a banlist we should skip it and process the next one.
