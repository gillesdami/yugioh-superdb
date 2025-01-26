import { CardScraper } from '../scrapers/card-scraper.js';
import { DbService } from './db-service.js';
import genTables from '../db/genTables.js';

export class SyncService {
  constructor() {
    this.scraper = new CardScraper();
    this.db = new DbService();
    this.batchSize = 10;
  }

  async initialize() {
    // Check if database needs initialization
    const lastId = await this.db.getLastProcessedCardId();
    if (lastId === 4006) {
      await this.initializeDatabase();
    }
  }

  async initializeDatabase() {
    genTables();
  }

  async syncCards() {
    await this.initialize();
    
    const lastProcessedId = await this.db.getLastProcessedCardId();
    const cardGenerator = this.scraper.scrapeCards(lastProcessedId + 1);

    let processedCount = 0;
    let errorCount = 0;
    
    for await (const cardData of cardGenerator) {
      try {
        await this.db.validateCardData(cardData);
        await this.db.insertCard(cardData);
        
        processedCount++;
        if (processedCount % this.batchSize === 0) {
          console.log(`Processed ${processedCount} cards...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing card ${cardData.id}:`, error.message);
      }
    }

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