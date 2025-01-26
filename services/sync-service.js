import { CardScraper } from '../scrapers/card-scraper.js';
import { DbService } from './db-service.js';

export class SyncService {
    async init() {
        this.scraper = new CardScraper();
        this.db = new DbService();
        await this.db.open();
        this.batchSize = 10;
    }

    async syncCards() {
        let lastProcessedId = await this.db.getLastProcessedCardId();
        console.log(`Last processed card ID: ${lastProcessedId}`);

        const cardGenerator = this.scraper.scrapeCards(lastProcessedId + 1);

        let processedCount = 0;
        let errorCount = 0;

        for await (const cardDatas of cardGenerator) {
            for (const cardData of cardDatas) {
                try {
                    await this.db.validateCardData(cardData);
                    await this.db.insertCard(cardData);
                } catch (error) {
                    errorCount++;
                    console.error(`Error processing card ${cardData.id} in lang ${cardData.locale}:`, error.message);
                    throw error;
                }
            }

            processedCount++;
            if (processedCount % this.batchSize === 0) {
                console.log(`Processed ${processedCount} cards...`);
            }
        }

        lastProcessedId = await this.db.getLastProcessedCardId();
        console.log(`Last processed card ID: ${lastProcessedId}`);

        return {
            totalProcessed: processedCount,
            totalErrors: errorCount,
            lastProcessedId: await this.db.getLastProcessedCardId()
        };
    }

    async close() {
        await this.db.close();
    }
}