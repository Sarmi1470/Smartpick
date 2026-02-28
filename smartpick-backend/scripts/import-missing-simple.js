const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Book = require('../src/models/Book.model');
const { BOOK_CATEGORIES } = require('../src/utils/constants');
require('dotenv').config();

// Category mapping function
function mapCategory(category) {
  if (!category) return null;
  
  const cleanCat = category.trim().replace(/['"]/g, '');
  
  // Direct match
  if (BOOK_CATEGORIES.includes(cleanCat)) return cleanCat;
  
  // Case-insensitive match
  const lowerCat = cleanCat.toLowerCase();
  const match = BOOK_CATEGORIES.find(c => c.toLowerCase() === lowerCat);
  if (match) return match;
  
  // Common mappings
  const mappings = {
    'young adult': 'Fiction',
    'ya': 'Fiction',
    'teen': 'Fiction',
    'childrens': 'Fiction',
    'kids': 'Fiction',
    'middle grade': 'Fiction',
    'picture books': 'Fiction',
    'graphic novels': 'Fiction',
    'comics': 'Fiction',
    'manga': 'Fiction',
    'contemporary': 'Fiction',
    'literary fiction': 'Fiction',
    'historical fiction': 'Fiction',
    'classics': 'Fiction',
    'classic literature': 'Fiction',
    'dystopia': 'Science Fiction',
    'post apocalyptic': 'Science Fiction',
    'apocalyptic': 'Science Fiction',
    'time travel': 'Science Fiction',
    'alternate history': 'Science Fiction',
    'steampunk': 'Science Fiction',
    'cyberpunk': 'Science Fiction',
    'urban fantasy': 'Fantasy',
    'high fantasy': 'Fantasy',
    'epic fantasy': 'Fantasy',
    'dark fantasy': 'Fantasy',
    'magic': 'Fantasy',
    'paranormal': 'Fantasy',
    'paranormal romance': 'Romance',
    'fantasy romance': 'Romance',
    'historical romance': 'Romance',
    'contemporary romance': 'Romance',
    'erotic romance': 'Romance',
    'romantic suspense': 'Romance',
    'mystery': 'Mystery',
    'mystery thriller': 'Mystery',
    'crime': 'Mystery',
    'detective': 'Mystery',
    'thriller': 'Thriller',
    'suspense': 'Thriller',
    'psychological thriller': 'Thriller',
    'horror': 'Thriller',
    'gothic': 'Thriller',
    'biography': 'Biography',
    'memoir': 'Biography',
    'autobiography': 'Biography',
    'history': 'History',
    'historical': 'History',
    'self help': 'Self-Help',
    'self-improvement': 'Self-Help',
    'personal development': 'Self-Help',
    'philosophy': 'Philosophy',
    'religion': 'Philosophy',
    'spirituality': 'Philosophy',
    'poetry': 'Poetry',
    'poems': 'Poetry',
    'nonfiction': 'Non-Fiction',
    'non-fiction': 'Non-Fiction',
    'science': 'Non-Fiction',
    'technology': 'Non-Fiction',
    'computer science': 'Non-Fiction',
    'business': 'Non-Fiction',
    'economics': 'Non-Fiction',
    'politics': 'Non-Fiction',
    'psychology': 'Non-Fiction',
    'sociology': 'Non-Fiction',
    'anthropology': 'Non-Fiction',
    'archaeology': 'Non-Fiction',
    'true crime': 'Non-Fiction',
    'travel': 'Non-Fiction',
    'cooking': 'Non-Fiction',
    'food': 'Non-Fiction',
    'art': 'Non-Fiction',
    'music': 'Non-Fiction',
    'photography': 'Non-Fiction',
    'design': 'Non-Fiction',
    'architecture': 'Non-Fiction',
    'education': 'Non-Fiction',
    'language': 'Non-Fiction',
    'mathematics': 'Non-Fiction',
    'physics': 'Non-Fiction',
    'chemistry': 'Non-Fiction',
    'biology': 'Non-Fiction',
    'medicine': 'Non-Fiction',
    'health': 'Non-Fiction',
    'fitness': 'Non-Fiction',
    'gardening': 'Non-Fiction',
    'parenting': 'Non-Fiction',
    'family': 'Non-Fiction',
    'relationships': 'Non-Fiction',
    'christian': 'Non-Fiction',
    'christian fiction': 'Fiction',
    'inspirational': 'Non-Fiction',
    'engineering': 'Non-Fiction',
    'law': 'Non-Fiction',
    'westerns': 'Fiction',
    'war': 'Fiction',
    'military fiction': 'Fiction',
    'adventure': 'Fiction',
    'action': 'Fiction',
    'short stories': 'Fiction',
    'essays': 'Non-Fiction',
    'anthologies': 'Fiction',
    'folklore': 'Fiction',
    'mythology': 'Fiction',
    'fairy tales': 'Fiction',
    'legends': 'Fiction',
    'drama': 'Fiction',
    'plays': 'Fiction',
    'theatre': 'Fiction',
    'vampires': 'Fantasy',
    'werewolves': 'Fantasy',
    'witches': 'Fantasy',
    'wizards': 'Fantasy',
    'dragons': 'Fantasy',
    'fairies': 'Fantasy',
    'fae': 'Fantasy',
    'angels': 'Fantasy',
    'demons': 'Fantasy',
    'ghosts': 'Fantasy',
    'zombies': 'Thriller'
  };
  
  return mappings[lowerCat] || 'Fiction';
}

function parseCategories(genres) {
  if (!genres || genres === '[]' || genres === '') return ['Fiction'];
  
  try {
    let cats = [];
    if (genres.startsWith('[')) {
      cats = genres.replace(/[\[\]']/g, '').split(',').map(c => c.trim().replace(/^'|'$/g, ''));
    } else {
      cats = genres.split(',').map(c => c.trim());
    }
    
    // Map and filter
    const mappedCats = cats
      .map(mapCategory)
      .filter(c => c && BOOK_CATEGORIES.includes(c));
    
    // Remove duplicates and limit
    const uniqueCats = [...new Set(mappedCats)];
    return uniqueCats.length > 0 ? uniqueCats.slice(0, 3) : ['Fiction'];
  } catch {
    return ['Fiction'];
  }
}

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
    
    console.log('🔍 Reading CSV and finding missing books...');
    
    // First read all CSV rows
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
    
    // Import missing books one by one
    let imported = 0;
    let failed = 0;
    
    for (const row of missingBooks) {
      try {
        const categories = parseCategories(row.genres);
        
        const bookData = {
          isbn: row.isbn || '',
          isbn13: row.isbn || '',
          title: row.title || 'Untitled',
          authors: row.author ? row.author.split(',').map(a => a.trim()) : ['Unknown Author'],
          publisher: row.publisher || '',
          pages: row.pages ? parseInt(row.pages) : null,
          language: row.language || 'EN',
          description: (row.description || '').substring(0, 1000), // Limit description length
          categories: categories,
          coverImage: {
            small: row.coverImg || '',
            medium: row.coverImg || '',
            large: row.coverImg || '',
            thumbnail: row.coverImg || ''
          },
          ratings: {
            average: row.rating ? parseFloat(row.rating) : 0,
            count: row.numRatings ? parseInt(row.numRatings) : 0
          },
          source: 'kaggle',
          importId: Date.now().toString()
        };
        
        // Generate slug
        if (bookData.title) {
          bookData.slug = bookData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .substring(0, 80);
          
          if (bookData.isbn) {
            bookData.slug = `${bookData.slug}-${bookData.isbn.slice(-6)}`;
          }
        } else {
          bookData.slug = `book-${bookData.isbn || Date.now()}`;
        }
        
        await Book.create(bookData);
        imported++;
        
        if (imported % 5 === 0) {
          console.log(`✅ Imported ${imported} books...`);
        }
        
      } catch (error) {
        failed++;
        console.log(`❌ Failed: ${row.title || 'Unknown'} - ${error.message}`);
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

importMissing();