import { CardScraper } from './scrapers/card-scraper.js';

const cardId = process.argv[2];
const locale = process.argv[3];
if (!cardId || !locale) {
  console.error('Usage: node scrapCardPreview.js <cardId> <locale>');
  process.exit(1);
}

(async () => {
  try {
    const scraper = new CardScraper();
    // Use provided locale
    scraper.LOCALES = [locale];

    const results = await scraper.scrapeCard(cardId);
    console.log(JSON.stringify(results[0], null, 2));
  } catch (error) {
    console.error('Error scraping card:', error);
    process.exit(1);
  }
})();