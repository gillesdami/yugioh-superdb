# Yu-Gi-Oh superdb

The goal is to create a sql light database of data related to yugioh cards by scrapping the website [yugiohdb](https://www.db.yugioh-card.com/yugiohdb).

- The code must be written in js and executed with nodejs.
- The code must allow iterative addition to the resulting data base, so that if data where to be added to the yugiohdb they could be added to the sql database without scrapping the whole site again.

## Automated Daily Updates

This repository includes GitHub Actions automation that:

- ✅ Runs daily at 2:00 AM UTC to sync the database
- ✅ Downloads the latest database from previous releases before syncing
- ✅ Creates releases when database changes are detected  
- ✅ Sends email notifications for updates, failures, and warnings
- ✅ Includes full logs and database statistics

See `GITHUB_ACTIONS_SETUP.md` for configuration instructions.

**Database Flow:**

1. Downloads latest `yugioh-superdb.sqlite` from the most recent release
2. If no releases exist, starts with a fresh database
3. Runs the sync script to update the database
4. Creates a new release if changes are detected

## Manual Usage

Run the sync script locally:

```bash
npm start          # Run original sync script
npm run sync       # Run enhanced sync with better logging
```

## The model

The tables of the database are defined in `db\genTables.sql`. The database can initially be generated with the script `db\genTables.js`.
