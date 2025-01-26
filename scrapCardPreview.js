import { CardScraper } from './scrapers/card-scraper.js';

const cardId = process.argv[2];
if (!cardId) {
  console.error('Please provide a card ID');
  process.exit(1);
}

(async () => {
  try {
    const scraper = new CardScraper();
    // Override LOCALES to only test English
    scraper.LOCALES = ['en'];
    
    const results = await scraper.scrapeCard(cardId);
    console.log(JSON.stringify(results[0], null, 2));
  } catch (error) {
    console.error('Error scraping card:', error);
    process.exit(1);
  }
})();