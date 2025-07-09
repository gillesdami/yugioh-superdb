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

                    // Check if set already exists
                    if (this.db.setExists(setName, locale)) {
                        console.log(`Set ${setName} (${locale}) already exists - skipping`);
                        continue;
                    }

                    await this.scrapeSetDetails(setName, setUrl, locale);
                    console.log(`Scraped set details for ${setName} (${locale}) - ${i + 1}/${sets.length}`);
                }
            } catch (error) {
                this.handleScrapingError(error, { locale });
            }
        }
    }

    async scrapeSetDetails(setName, setUrl, locale) {
        try {
            // Ensure we add the locale parameter to the URL
            const urlObj = new URL(setUrl);
            urlObj.searchParams.set('request_locale', locale);
            const localizedUrl = urlObj.toString();

            const document = await this.parseHTML(localizedUrl);

            // Try multiple selectors for card IDs
            let cardIds = [];

            // Method 1: Look for input.link_value (original method)
            cardIds = [...document.querySelectorAll('input.link_value')]
                .map(input => {
                    const match = input.value.match(/cid=(\d+)/);
                    return match ? match[1] : null;
                })
                .filter(id => id !== null);

            // Method 2: Look for links with cid parameter
            if (cardIds.length === 0) {
                cardIds = [...document.querySelectorAll('a[href*="cid="]')]
                    .map(link => {
                        const match = link.href.match(/cid=(\d+)/);
                        return match ? match[1] : null;
                    })
                    .filter(id => id !== null);
            }

            // Method 3: Look for input[name="cid"] elements
            if (cardIds.length === 0) {
                cardIds = [...document.querySelectorAll('input[name="cid"]')]
                    .map(input => input.value)
                    .filter(id => id && id !== '');
            }

            console.log(`Found ${cardIds.length} cards for set: ${setName}`);

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
                console.log(`No release date element found for ${setName}`);
                // For promotional sets or sets without release dates, we might need to skip or use a default
                releaseDate = null;
            }

            // Only insert if we have cards, otherwise skip this set
            if (cardIds.length > 0) {
                this.db.insertOrReplaceSetDetails({
                    setName,
                    cardIds,
                    locale,
                    releaseDate,
                    cardNumber: ''
                });
            } else {
                console.log(`Skipping set ${setName} - no cards found`);
            }
        } catch (error) {
            this.handleScrapingError(error, { setName, setUrl, locale });
        }
    }
}
