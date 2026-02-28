const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Book = require('../src/models/Book.model');  // Updated path with src/
require('dotenv').config();

async function importMissing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all existing ISBNs
    const existingBooks = await Book.find({}, { isbn: 1 }).lean();
    const existingIsbns = new Set(existingBooks.map(b => b.isbn).filter(Boolean));
    
    console.log(`📚 Found ${existingIsbns.size} existing books`);
    
    const csvPath = path.join(__dirname, '..', 'data', 'books.csv');
    const missingBooks = [];
    
    console.log('🔍 Scanning for missing books...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
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
      console.log('✅ All books are already imported!');
      process.exit(0);
    }
    
    // Import missing books
    let imported = 0;
    let failed = 0;
    
    for (const row of missingBooks) {
      try {
        // Create book data with proper handling
        const bookData = {
          isbn: row.isbn || '',
          isbn13: row.isbn || '',
          bookId: row.bookId || '',
          title: row.title || '',
          series: row.series || '',
          slug: generateSlug(row.title, row.isbn),
          authors: row.author ? row.author.split(',').map(a => a.trim()) : ['Unknown Author'],
          publisher: row.publisher || '',
          pages: row.pages ? parseInt(row.pages) : null,
          language: row.language || 'English',
          description: row.description || '',
          categories: parseArrayField(row.genres) || ['Fiction'],
          characters: parseArrayField(row.characters) || [],
          awards: parseArrayField(row.awards) || [],
          setting: parseArrayField(row.setting) || [],
          coverImage: {
            small: row.coverImg || '',
            medium: row.coverImg || '',
            large: row.coverImg || '',
            thumbnail: row.coverImg || ''
          },
          ratings: {
            average: row.rating ? parseFloat(row.rating) : 0,
            count: row.numRatings ? parseInt(row.numRatings) : 0,
            likedPercent: row.likedPercent ? parseInt(row.likedPercent) : 0
          },
          bbeScore: row.bbeScore ? parseInt(row.bbeScore) : 0,
          bbeVotes: row.bbeVotes ? parseInt(row.bbeVotes) : 0,
          price: parsePrice(row.price),
          source: 'kaggle',
          importId: Date.now().toString()
        };
        
        await Book.create(bookData);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported} books...`);
        }
        
      } catch (error) {
        failed++;
        console.log(`❌ Failed to import: ${row.title} - ${error.message}`);
      }
    }
    
    console.log(`
📊 Missing Import Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully imported: ${imported}
❌ Failed: ${failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Helper functions
function generateSlug(title, isbn) {
  if (!title) return `book-${isbn || Date.now()}`;
  
  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 80);
  
  if (isbn) {
    slug = `${slug}-${isbn.slice(-6)}`;
  }
  
  return slug;
}

function parseArrayField(field) {
  if (!field) return [];
  try {
    if (field.startsWith('[')) {
      return field.replace(/[\[\]']/g, '').split(',').map(g => g.trim()).filter(g => g);
    }
    return field.split(',').map(g => g.trim());
  } catch {
    return [];
  }
}

function parsePrice(price) {
  if (!price) return 0;
  const match = price.toString().match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

importMissing();