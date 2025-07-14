import { access, readFile, writeFile, mkdir, copyFile } from 'fs/promises';
import { constants, createReadStream, createWriteStream } from 'fs';
import { promisify } from 'util';
import path from 'path';
import yauzl from 'yauzl';
import yazl from 'yazl';

// File constants
export const DATABASE_FILE = 'yugioh-superdb.sqlite';
export const TRANSLATION_FILE = 'translation.json';
export const RELEASE_ARCHIVE = 'yugioh-superdb.zip';
export const ASSETS_PATH = 'dist/assets';

// Helper function to check if file exists
export async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Helper function to ensure directory exists
async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function extractDatabaseFromZip(log) {
  log.info('Checking for existing database files...');
  
  const zipPath = path.join(ASSETS_PATH, RELEASE_ARCHIVE);
  const dbPath = DATABASE_FILE;
  const translationPath = TRANSLATION_FILE;
  
  // Check if zip file exists
  if (await fileExists(zipPath)) {
    log.info(`Found zip archive at ${zipPath}, extracting...`);
    
    try {
      await extractZipFile(zipPath, '.');
      log.success('Database files extracted successfully');
      
      // Verify extracted files
      if (await fileExists(dbPath)) {
        log.info(`Database file verified: ${dbPath}`);
      } else {
        log.warn(`Database file not found after extraction: ${dbPath}`);
      }
      
      if (await fileExists(translationPath)) {
        log.info(`Translation file verified: ${translationPath}`);
      } else {
        log.warn(`Translation file not found after extraction: ${translationPath}`);
      }
      
    } catch (error) {
      log.error(`Failed to extract zip file: ${error.message}`);
      throw error;
    }
  } else {
    // Check for individual files in assets
    const assetDbPath = path.join(ASSETS_PATH, DATABASE_FILE);
    const assetTranslationPath = path.join(ASSETS_PATH, TRANSLATION_FILE);
    
    if (await fileExists(assetDbPath)) {
      log.info(`Found database file in assets, copying to working directory...`);
      await copyFile(assetDbPath, dbPath);
    }
    
    if (await fileExists(assetTranslationPath)) {
      log.info(`Found translation file in assets, copying to working directory...`);
      await copyFile(assetTranslationPath, translationPath);
    }
    
    if (!(await fileExists(assetDbPath)) && !(await fileExists(zipPath))) {
      throw new Error(`No existing database found in ${ASSETS_PATH}. Please bootstrap with an initial database.`);
    }
  }
}

// Helper function to extract zip file using yauzl
async function extractZipFile(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err);
        return;
      }
      
      let pendingEntries = 0;
      let finished = false;
      
      zipfile.readEntry();
      
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          zipfile.readEntry();
        } else {
          // File entry
          pendingEntries++;
          
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err);
              return;
            }
            
            const outputPath = path.join(extractPath, entry.fileName);
            const writeStream = createWriteStream(outputPath);
            
            readStream.pipe(writeStream);
            
            writeStream.on('close', () => {
              pendingEntries--;
              if (pendingEntries === 0 && finished) {
                resolve();
              }
            });
            
            writeStream.on('error', reject);
            readStream.on('error', reject);
          });
          
          zipfile.readEntry();
        }
      });
      
      zipfile.on('end', () => {
        finished = true;
        if (pendingEntries === 0) {
          resolve();
        }
      });
      
      zipfile.on('error', reject);
    });
  });
}

export async function createZipArchive(log) {
  log.info('Creating zip archive with updated database files...');
  
  const dbPath = DATABASE_FILE;
  const translationPath = TRANSLATION_FILE;
  const zipPath = RELEASE_ARCHIVE;
  
  // Verify source files exist
  if (!(await fileExists(dbPath))) {
    throw new Error(`Database file not found: ${dbPath}`);
  }
  
  if (!(await fileExists(translationPath))) {
    log.warn(`Translation file not found: ${translationPath}`);
  }
  
  try {
    // Create zip archive using yazl
    const filesToZip = [dbPath];
    if (await fileExists(translationPath)) {
      filesToZip.push(translationPath);
    }
    
    await createZipFile(zipPath, filesToZip);
    log.success(`Created zip archive: ${zipPath}`);
    
    // Copy to assets directory
    const assetsPath = path.join(ASSETS_PATH);
    await ensureDir(assetsPath);
    
    // Copy zip and individual files to assets
    await copyFile(zipPath, path.join(assetsPath, RELEASE_ARCHIVE));
    await copyFile(dbPath, path.join(assetsPath, DATABASE_FILE));
    
    if (await fileExists(translationPath)) {
      await copyFile(translationPath, path.join(assetsPath, TRANSLATION_FILE));
    }
    
    log.success('Files copied to assets directory');
    
  } catch (error) {
    log.error(`Failed to create zip archive: ${error.message}`);
    throw error;
  }
}

// Helper function to create zip file using yazl
async function createZipFile(zipPath, filePaths) {
  return new Promise((resolve, reject) => {
    const zipfile = new yazl.ZipFile();
    let addedFiles = 0;
    const totalFiles = filePaths.length;
    
    if (totalFiles === 0) {
      reject(new Error('No files to zip'));
      return;
    }
    
    // Add each file to the zip
    filePaths.forEach((filePath) => {
      const fileName = path.basename(filePath);
      zipfile.addFile(filePath, fileName);
      addedFiles++;
      
      if (addedFiles === totalFiles) {
        zipfile.end();
      }
    });
    
    // Write the zip file
    const writeStream = createWriteStream(zipPath);
    zipfile.outputStream.pipe(writeStream);
    
    writeStream.on('close', () => {
      resolve();
    });
    
    writeStream.on('error', reject);
    zipfile.outputStream.on('error', reject);
  });
}
