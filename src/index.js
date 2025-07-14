#!/usr/bin/env node
import { SyncService } from './services/sync-service.js';
import { TranslationScraper } from './scrapers/translation-scraper.js'; 

// Store original stderr.write method
const originalStderrWrite = process.stderr.write;

// Override stderr to filter out "NO_DATA_FOUND" messages
process.stderr.write = function(string, encoding, fd) {
  // Check if this is a "NO_DATA_FOUND" message that should be filtered
  if (typeof string === 'string' && string.includes('NO_DATA_FOUND:')) {
    // Don't write to stderr, but we can optionally log it differently
    return true;
  }
  
  // For all other stderr content, use the original method
  return originalStderrWrite.call(process.stderr, string, encoding, fd);
};

// Enhanced logging with prefixes
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} ${msg}`)
};

// Track overall statistics
const stats = {
  startTime: Date.now(),
  warnings: 0,
  errors: 0,
  processedCards: 0,
  processedSets: 0,
  processedBanlists: 0
};

async function syncCards() {
  const syncService = new SyncService();
  
  try {
    await syncService.init();
    
    log.info('Starting card sync...');
    const result = await syncService.syncCards();
    
    // Assume syncCards returns some statistics
    if (result && result.processed) {
      stats.processedCards = result.processed;
      log.success(`Card sync completed: ${result.processed} cards processed`);
    } else {
      log.success('Card sync completed');
    }
    
    return true;
  } catch (error) {
    stats.errors++;
    log.error(`Card sync failed: ${error.message}`);
    throw error;
  } finally {
    await syncService.close();
    log.info('Card sync service shut down');
  }
}

async function scrapeTranslations() {
  log.info('Starting translation scraping...');
  
  const translationScraper = new TranslationScraper();
  
  try {
    const translations = await translationScraper.scrape();
    
    if (translations && Object.keys(translations).length > 0) {
      log.success(`Translation scraping completed: ${Object.keys(translations).length} translations found`);
      
      // Save translations to file
      const fs = await import('fs/promises');
      await fs.writeFile('dist/assets/translation.json', JSON.stringify(translations, null, 2));
      log.info('Translations saved to dist/assets/translation.json');

      return translations;
    } else {
      log.warn('No translations found during scraping');
      return {};
    }
  } catch (error) {
    stats.errors++;
    log.error(`Translation scraping failed: ${error.message}`);
    throw error;
  }
}

async function scrapeBanlists() {
  log.info('Starting banlist scraping...');
  const syncService = new SyncService();
  
  try {
    await syncService.init();
    const result = await syncService.scrapeBanlists();
    
    // Assume scrapeBanlists returns some statistics
    if (result && result.processed) {
      stats.processedBanlists = result.processed;
      log.success(`Banlist scraping completed: ${result.processed} banlists processed`);
    } else {
      log.success('Banlist scraping completed');
    }
    
    return true;
  } catch (error) {
    stats.errors++;
    log.error(`Banlist scraping failed: ${error.message}`);
    throw error;
  } finally {
    await syncService.close();
    log.info('Banlist sync service shut down');
  }
}

async function scrapeSets() {
  log.info('Starting set scraping...');
  const syncService = new SyncService();
  
  try {
    await syncService.init();
    const result = await syncService.scrapeSets();
    
    // Assume scrapeSets returns some statistics
    if (result && result.processed) {
      stats.processedSets = result.processed;
      log.success(`Set scraping completed: ${result.processed} sets processed`);
    } else {
      log.success('Set scraping completed');
    }
    
    return true;
  } catch (error) {
    stats.errors++;
    log.error(`Set scraping failed: ${error.message}`);
    throw error;
  } finally {
    await syncService.close();
    log.info('Set sync service shut down');
  }
}

function printFinalStats() {
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  log.info('=== FINAL SYNC STATISTICS ===');
  log.info(`Total duration: ${minutes}m ${seconds}s`);
  log.info(`Cards processed: ${stats.processedCards}`);
  log.info(`Sets processed: ${stats.processedSets}`);
  log.info(`Banlists processed: ${stats.processedBanlists}`);
  log.info(`Total warnings: ${stats.warnings}`);
  log.info(`Total errors: ${stats.errors}`);
  
  if (stats.errors === 0 && stats.warnings === 0) {
    log.success('Sync completed successfully with no issues');
  } else if (stats.errors === 0) {
    log.warn(`Sync completed with ${stats.warnings} warnings`);
  } else {
    log.error(`Sync completed with ${stats.errors} errors and ${stats.warnings} warnings`);
  }
}

async function main() {
  try {
    log.info('=== Yu-Gi-Oh SuperDB Sync Started ===');
    log.info(`Node.js version: ${process.version}`);
    
    // Run all sync operations
    await scrapeTranslations();
    await scrapeBanlists();
    await scrapeSets();
    await syncCards();
    
    printFinalStats();
    
    if (stats.errors > 0) {
      log.error('Sync completed with errors - exiting with error code');
      process.exit(1);
    }
    
    log.success('All sync operations completed successfully');
    process.exit(0);
    
  } catch (error) {
    stats.errors++;
    log.error(`Fatal error during sync: ${error.message}`);
    log.error(`Stack trace: ${error.stack}`);
    
    printFinalStats();
    process.exit(1);
  }
}

main();
