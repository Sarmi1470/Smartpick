const mongoose = require('mongoose');
const csvImportService = require('../src/services/csvImport.service');  // Updated path
require('dotenv').config();

async function runImport() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);

    // Path to your CSV file
    const csvPath = 'data/books.csv';

    console.log('🚀 Starting import of 52,478 books...');
    console.log('⏳ This may take 5-10 minutes depending on your system\n');

    const stats = await csvImportService.importFromCSV(csvPath, {
      clearExisting: true,
      batchSize: 100,
      onProgress: (progress) => {
        const percent = ((progress.processed / 52478) * 100).toFixed(1);
        console.log(`📊 Progress: ${progress.processed}/52478 rows (${percent}%) - ${progress.imported} imported`);
      }
    });

    console.log('\n📊 Final Import Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total processed: ${stats.total}`);
    console.log(`✅ Imported: ${stats.imported}`);
    console.log(`⏭️ Skipped: ${stats.skipped}`);
    console.log(`❌ Failed: ${stats.failed}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️ First 10 errors:');
      stats.errors.slice(0, 10).forEach((error, index) => {
        console.log(`  ${index + 1}. ISBN: ${error.isbn || 'unknown'} - Errors:`, error.errors || error.error);
      });
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

runImport();