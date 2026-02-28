const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

async function analyzeMissing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    
    // Get all ISBNs from database
    const dbBooks = await books.find({}, { projection: { isbn: 1, title: 1 } }).toArray();
    const dbIsbns = new Set(dbBooks.map(b => b.isbn).filter(Boolean));
    
    console.log(`📚 Database has ${dbBooks.length} books with ${dbIsbns.size} unique ISBNs`);
    
    // Read CSV and find missing books
    const csvPath = path.join(__dirname, '..', 'data', 'books.csv');
    const missingBooks = [];
    const sampleMissing = [];
    
    let totalRows = 0;
    let missingCount = 0;
    
    console.log('\n🔍 Scanning CSV for missing books...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          totalRows++;
          const isbn = row.isbn || '';
          
          if (!dbIsbns.has(isbn)) {
            missingCount++;
            
            // Store sample of missing books for analysis
            if (sampleMissing.length < 100) {
              sampleMissing.push({
                title: row.title,
                author: row.author,
                isbn: isbn,
                rating: row.rating,
                pages: row.pages,
                language: row.language
              });
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`   Total CSV rows: ${totalRows}`);
    console.log(`   Books in database: ${dbBooks.length}`);
    console.log(`   Missing books: ${missingCount}`);
    
    if (sampleMissing.length > 0) {
      console.log('\n📖 Sample of missing books (first 10):');
      sampleMissing.slice(0, 10).forEach((book, i) => {
        console.log(`\n${i + 1}. Title: ${book.title || 'N/A'}`);
        console.log(`   Author: ${book.author || 'N/A'}`);
        console.log(`   ISBN: ${book.isbn || 'N/A'}`);
        console.log(`   Pages: ${book.pages || 'N/A'}`);
        console.log(`   Language: ${book.language || 'N/A'}`);
        console.log(`   Rating: ${book.rating || 'N/A'}`);
      });
      
      // Analyze patterns in missing books
      console.log('\n🔍 Analyzing missing books patterns:');
      
      const noIsbn = sampleMissing.filter(b => !b.isbn).length;
      const noTitle = sampleMissing.filter(b => !b.title).length;
      const noAuthor = sampleMissing.filter(b => !b.author).length;
      const lowPages = sampleMissing.filter(b => parseInt(b.pages) < 10).length;
      const lowRating = sampleMissing.filter(b => parseFloat(b.rating) < 3.0).length;
      
      console.log(`   Missing ISBN: ${noIsbn}`);
      console.log(`   Missing Title: ${noTitle}`);
      console.log(`   Missing Author: ${noAuthor}`);
      console.log(`   Less than 10 pages: ${lowPages}`);
      console.log(`   Rating below 3.0: ${lowRating}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeMissing();