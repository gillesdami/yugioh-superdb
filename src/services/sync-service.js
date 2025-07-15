import { CardScraper } from '../scrapers/card-scraper.js';
import { DbService } from './db-service.js';
import { BanlistScraper } from '../scrapers/banlist-scraper.js';
import { SetScraper } from '../scrapers/set-scraper.js';

export class SyncService {
    constructor(options = {}) {
        this.options = options;
    }
    
    async init() {
        this.db = new DbService();
        await this.db.open();
        this.batchSize = 10;
    }

    async syncCards() {
        const scraper = new CardScraper();
        const scrapeCardsConfig = this.options.cardIds ?? (this.db.getLastProcessedCardId() + 1)
        const cardGenerator = scraper.scrapeCards(scrapeCardsConfig);

        let processedCount = 0;
        let errorCount = 0;

        for await (const cardDatas of cardGenerator) {
            for (const cardData of cardDatas) {
                try {
                    this.db.validateCardData(cardData);
                    this.db.insertCard(cardData);
                } catch (error) {
                    errorCount++;
                    console.error(`Error processing card ${cardData.id} in lang ${cardData.locale}:`, error.message);

                    if (process.argv.includes('--stop-on-error')) {
                        throw error;
                    }
                }
            }

            processedCount++;
            if (processedCount % this.batchSize === 0) {
                console.log(`Processed ${processedCount} cards...`);
            }
        }

        const lastProcessedId = this.db.getLastProcessedCardId();
        console.log(`Last processed card ID: ${lastProcessedId}`);

        return {
            totalProcessed: processedCount,
            totalErrors: errorCount,
            lastProcessedId: this.db.getLastProcessedCardId()
        };
    }

    async scrapeBanlists() {
        const scraper = new BanlistScraper(this.db);
        await scraper.scrapeBanlists();
    }

    async scrapeSets() {
        const scraper = new SetScraper(this.db);
        await scraper.scrapeSets();
    }

    async close() {
        this.db.close();
    }
}