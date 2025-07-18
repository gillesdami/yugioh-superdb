import { BaseScraper } from './base-scraper.js';

export class BanlistScraper extends BaseScraper {
    constructor(db) {
        super();
        this.db = db;
    }

    async fetchBanlistDates(locale) {
        const url = `https://www.db.yugioh-card.com/yugiohdb/forbidden_limited.action?request_locale=${locale}`;
        const document = await this.parseHTML(url);
        const options = document.querySelectorAll('#forbiddenLimitedDate option');
        return Array.from(options).map(option => option.value);
    }

    async scrapeBanlists() {
        const scopes = [
            ['ja', 'OCG'],
            ['en', 'TCG'],
        ];

        for (const [locale, region] of scopes) {
            const dates = await this.fetchBanlistDates(locale);

            // Sort dates chronologically to ensure proper until_date updates
            dates.sort();
            
            for (const date of dates) {
                if (this.db.getBanlistId(date, region) === undefined) {
                    console.log(`Scraping banlist for ${region} at date ${date}...`);
                    
                    // Update the until_date of the previous banlist
                    this.db.updatePreviousBanlistUntilDate(date, region);
                    
                    // Then scrape the new banlist
                    await this.scrapeBanlist(date, locale, region);
                }
            }
        }
    }

    async scrapeBanlist(date, locale, region) {
        const url = `https://www.db.yugioh-card.com/yugiohdb/forbidden_limited.action?forbiddenLimitedDate=${date}&request_locale=${locale}`;

        try {
            const document = await this.parseHTML(url);
            const lists = ['list_forbidden', 'list_limited', 'list_semi_limited'];
            const banlistId = this.db.getOrCreateBanlistId(date, region);

            for (const listName of lists) {
                const list = document.getElementById(listName);
                if (!list) {
                    console.log(`INFO: No list found for ${listName} at date ${date} for locale ${locale}`);
                    continue;
                };

                const inputs = list.querySelectorAll('input.link_value');
                for (const input of inputs) {
                    const cid = input.value.match(/cid=(\d+)/)[1];
                    this.db.saveLimitation(banlistId, cid, listName);
                }
            }
        } catch (error) {
            this.handleScrapingError(error, { date, locale });
        }
    }
}