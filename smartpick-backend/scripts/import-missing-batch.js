const mongoose = require('mongoose');
const path = require('path');
const csvImportService = require('../src/services/csvImport.service');
require('dotenv').config();

async function importMissingBatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const csvPath = path.join(__dirname, '..', 'data', 'missing-books.csv');
    
    console.log('🚀 Importing missing books...');
    
    const stats = await csvImportService.importFromCSV(csvPath, {
      clearExisting: false, // Don't clear existing books
      batchSize: 10, // Smaller batch size for missing books
      onProgress: (progress) => {
        console.log(`📊 Progress: ${progress.processed} rows processed, ${progress.imported} imported`);
      }
    });
    
    console.log(`
📊 Missing Import Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully imported: ${stats.imported}
❌ Failed: ${stats.failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importMissingBatch();