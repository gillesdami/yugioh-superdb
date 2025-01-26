import { BaseScraper } from './base-scraper.js';
import { parseJapaneseDate, parseYYYYMMDD, parseMMDDYYYY, parseDDMMYYYY } from '../utils/dateParsers.js';

export class SetScraper extends BaseScraper {
    constructor(db) {
        super();
        this.db = db;
        this.BASE_URL = 'https://www.db.yugioh-card.com/yugiohdb/card_list.action?wname=CardSearch&request_locale=LOC';
    }

    async scrapeSets() {
        for (const locale of this.LOCALES) {
            const url = this.getLocaleUrl(this.BASE_URL, locale);
            try {
                const document = await this.parseHTML(url);
                const setNames = [...document.querySelectorAll('.pack > p > strong')].map(strong => strong.textContent.trim());
                const setUrls = [...document.querySelectorAll('input.link_value')].map(input => input.value);

                for (let i = 0; i < setNames.length; i++) {
                    const setName = setNames[i];
                    const setUrl = 'https://www.db.yugioh-card.com' + setUrls[i];

                    // Check if set already exists
                    if (this.db.setExists(setName, locale)) {
                        console.log(`Set ${setName} (${locale}) already exists - skipping`);
                        continue;
                    }

                    await this.scrapeSetDetails(setName, setUrl, locale);
                    console.log(`Scraped set details for ${setName} (${locale}) - ${i + 1}/${setNames.length}`);
                }
            } catch (error) {
                this.handleScrapingError(error, { locale });
            }
        }
    }

    async scrapeSetDetails(setName, setUrl, locale) {
        try {
            const document = await this.parseHTML(setUrl);
            const cardIds = [...document.querySelectorAll('input.link_value')]
                .map(input => input.value.match(/cid=(\d+)/)[1]);

            const releaseDateText = document.querySelector('#previewed').textContent.trim();
            let releaseDate = null;
            if (locale === "ja") {
                releaseDate = parseJapaneseDate(releaseDateText);
            } else if (locale === "ko") {
                releaseDate = parseYYYYMMDD(releaseDateText);
            } else if (locale === "en") {
                releaseDate = parseMMDDYYYY(releaseDateText);
            } else {
                releaseDate = parseDDMMYYYY(releaseDateText);
            }

            this.db.insertOrReplaceSetDetails({
                setName,
                cardIds,
                locale,
                releaseDate,
                cardNumber: ''
            });
        } catch (error) {
            this.handleScrapingError(error, { setName, setUrl, locale });
        }
    }
}
