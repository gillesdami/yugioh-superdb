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
                const sets = [...document.querySelectorAll('div.greater_than')].map(el => el.parentElement).map(p => [
                    p.querySelector("p").textContent.trim(), // Get the set name
                    'https://www.db.yugioh-card.com' + p.querySelector("input.link_value").value // Get the set URL
                ]);

                for (let i = 0; i < sets.length; i++) {
                    const [setName, setUrl] = sets[i];

                    const urlObj = new URL(setUrl);
                    urlObj.searchParams.set('request_locale', locale);
                    const localizedUrl = urlObj.toString();
                    const setId = urlObj.searchParams.get('pid');

                    if (this.db.setExists(setId)) {
                        console.log(`Set ${setName} (${locale}) already exists - skipping`);
                        continue;
                    }

                    await this.scrapeSetDetails(setName, localizedUrl, setId, locale);
                    console.log(`Scraped set details for ${setName} (${locale}) - ${i + 1}/${sets.length}`);
                }
            } catch (error) {
                this.handleScrapingError(error, { locale });
            }
        }
    }

    async scrapeSetDetails(setName, setUrl, setId, locale) {
        try {
            const document = await this.parseHTML(setUrl);

            // A set may contains multiple art but the info is not available
            //const artworkIds = [...document.querySelectorAll('.cardimg > img')].map(img => img.src.match(/ciid=(\d+)/)[1]);

            // Try multiple selectors for release date
            let releaseDate = null;
            const releaseDateElement = document.querySelector('#previewed') || 
                document.querySelector('.release_date') ||
                document.querySelector('.date_info') ||
                document.querySelector('.product_info');

            if (releaseDateElement) {
                const releaseDateText = releaseDateElement.textContent.trim();
                if (locale === "ja") {
                    releaseDate = parseJapaneseDate(releaseDateText);
                } else if (locale === "ko") {
                    releaseDate = parseYYYYMMDD(releaseDateText);
                } else if (locale === "en") {
                    releaseDate = parseMMDDYYYY(releaseDateText);
                } else {
                    releaseDate = parseDDMMYYYY(releaseDateText);
                }
                console.log(`Release date for ${setName}: ${releaseDate}`);
            } else {
                console.log(`INFO: No release date element found for ${setName}`);
            }

            this.db.insertOrReplaceSetDetails({
                setId,
                setName,
                locale,
                releaseDate
            });
        } catch (error) {
            this.handleScrapingError(error, { setName, setUrl, locale });
        }
    }
}
