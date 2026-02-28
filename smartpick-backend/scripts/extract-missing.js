const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Book = require('../src/models/Book.model');
require('dotenv').config();

async function extractMissing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all existing ISBNs
    const existingBooks = await Book.find({}, { isbn: 1 }).lean();
    const existingIsbns = new Set(existingBooks.map(b => b.isbn).filter(Boolean));
    
    console.log(`📚 Found ${existingIsbns.size} existing books`);
    
    const csvPath = path.join(__dirname, '..', 'data', 'books.csv');
    const missingBooks = [];
    let headers = [];
    
    console.log('🔍 Reading CSV and finding missing books...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (row) => {
          const isbn = row.isbn || '';
          if (!existingIsbns.has(isbn)) {
            missingBooks.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📖 Found ${missingBooks.length} missing books`);
    
    if (missingBooks.length === 0) {
      console.log('✅ No missing books found!');
      process.exit(0);
    }
    
    // Write missing books to a new CSV
    const outputPath = path.join(__dirname, '..', 'data', 'missing-books.csv');
    const writeStream = fs.createWriteStream(outputPath);
    
    // Write headers
    writeStream.write(headers.join(',') + '\n');
    
    // Write each missing book
    missingBooks.forEach(book => {
      const row = headers.map(header => {
        const value = book[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
      writeStream.write(row + '\n');
    });
    
    writeStream.end();
    console.log(`✅ Saved ${missingBooks.length} missing books to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

extractMissing();