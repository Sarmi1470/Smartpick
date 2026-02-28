const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

async function debugImport() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);

    const csvPath = path.join(__dirname, '..', 'data', 'books.csv');
    
    console.log('\n🔍 Debugging CSV import...');
    console.log('CSV Path:', csvPath);
    
    let rowCount = 0;
    let firstRow = null;
    const columnNames = new Set();
    
    // Read the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('headers', (headers) => {
          console.log('\n📋 CSV Column Headers:');
          headers.forEach((header, i) => {
            console.log(`   ${i + 1}. "${header}"`);
            columnNames.add(header);
          });
        })
        .on('data', (row) => {
          rowCount++;
          if (rowCount === 1) {
            firstRow = row;
            console.log('\n📝 First row sample:');
            console.log(JSON.stringify(row, null, 2).substring(0, 1000));
          }
        })
        .on('end', () => {
          console.log(`\n📊 Total rows in CSV: ${rowCount}`);
          
          // Check if books collection has data
          db.collection('books').countDocuments().then(count => {
            console.log(`\n📚 Books in database before import: ${count}`);
            
            // Show a sample of what would be mapped
            if (firstRow) {
              console.log('\n🔄 How first book would be mapped:');
              const mappedBook = {
                title: firstRow.title,
                isbn: firstRow.isbn,
                authors: firstRow.author ? [firstRow.author] : ['Unknown'],
                publisher: firstRow.publisher,
                pages: firstRow.pages ? parseInt(firstRow.pages) : null,
                language: firstRow.language,
                rating: firstRow.rating ? parseFloat(firstRow.rating) : null,
                numRatings: firstRow.numRatings ? parseInt(firstRow.numRatings) : null
              };
              console.log(JSON.stringify(mappedBook, null, 2));
            }
            
            resolve();
          });
        })
        .on('error', reject);
    });

    // Close connection
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugImport();