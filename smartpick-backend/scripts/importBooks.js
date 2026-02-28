const path = require('path');
const connectDB = require('../src/config/database');
const csvImportService = require('../src/services/csvImport.service');

// Path to your Kaggle CSV file
const CSV_PATH = path.join(__dirname, '../data/books.csv');

async function importBooks() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🚀 Starting book import...');
    
    // Import from CSV
    const stats = await csvImportService.importFromCSV(CSV_PATH, {
      clearExisting: false, // Set to true to replace all books
      batchSize: 100
    });
    
    console.log('✅ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import
importBooks();