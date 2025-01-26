import { SyncService } from './services/sync-service.js';

async function main() {
  const syncService = new SyncService();
  
  try {
    console.log('Starting Yugioh DB sync...');
    const result = await syncService.syncCards();
    
    console.log('\nSync completed:');
    console.log(`- Total cards processed: ${result.totalProcessed}`);
    console.log(`- Total errors: ${result.totalErrors}`);
    console.log(`- Last processed ID: ${result.lastProcessedId}`);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  } finally {
    await syncService.close();
    console.log('Sync service shut down');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});