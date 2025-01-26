import { SyncService } from './services/sync-service.js';
import { TranslationScraper } from './scrapers/translation-scraper.js';
import { access } from 'fs/promises';
import { constants } from 'fs';

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function syncCards() {
  const syncService = new SyncService();
  await syncService.init();

  try {
    console.log('Starting Yugioh DB sync...');
    const result = await syncService.syncCards();

    console.log('\nSync completed:');
    console.log(`- Total cards processed: ${result.totalProcessed}`);
    console.log(`- Total errors: ${result.totalErrors}`);
    console.log(`- Last processed ID: ${result.lastProcessedId}`);
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  } finally {
    await syncService.close();
    console.log('Sync service shut down');
  }
}

async function scrapeTranslations() {
  const translationsFile = 'translations.json';

  if (await fileExists(translationsFile)) {
    console.log('translations.json already exists - skipping scraping');
    return;
  }

  try {
    console.log('Starting translation scraping...');
    const scraper = new TranslationScraper();
    const translations = await scraper.scrapeAll();

    const success = await scraper.saveToFile(translations);
    if (success) {
      console.log('Translations successfully saved to translations.json');
    } else {
      console.error('Failed to save translations');
    }
  } catch (error) {
    console.error('Translation scraping failed:', error);
    throw error;
  }
}

async function scrapeBanlists() {
  console.log('Starting banlist scraping...');
  const syncService = new SyncService();
  await syncService.init();
  await syncService.scrapeBanlists();
  await syncService.close();
  console.log('Set banlist completed');
}

async function scrapeSets() {
  console.log('Starting set scraping...');
  const syncService = new SyncService();
  await syncService.init();
  await syncService.scrapeSets();
  await syncService.close();
  console.log('Set scraping completed');
}

async function main() {
  try {
    await scrapeTranslations();
    await scrapeBanlists();
    await scrapeSets();
    //await syncCards();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();