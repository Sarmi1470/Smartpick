const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Book = require('../src/models/Book.model');
const { BOOK_CATEGORIES } = require('../src/utils/constants');
require('dotenv').config();

function mapCategory(category) {
  if (!category) return null;
  
  // Clean up the category
  const cleanCat = category.trim().replace(/['"]/g, '');
  
  // Try exact match first
  if (BOOK_CATEGORIES.includes(cleanCat)) return cleanCat;
  
  // Try case-insensitive match
  const lowerCat = cleanCat.toLowerCase();
  const match = BOOK_CATEGORIES.find(c => c.toLowerCase() === lowerCat);
  if (match) return match;
  
  // Handle common variations
  const variations = {
    'sci-fi': 'Science Fiction',
    'scifi': 'Science Fiction',
    'sf': 'Science Fiction',
    'ya': 'Young Adult',
    'teen': 'Young Adult',
    'kids': "Children's",
    'children': "Children's",
    'child': "Children's",
    'kid': "Children's",
    'nonfiction': 'Non-Fiction',
    'non fiction': 'Non-Fiction',
    'autobiography': 'Biography',
    'cookbook': 'Cooking',
    'cook books': 'Cooking',
    'programming': 'Technology',
    'coding': 'Technology',
    'web development': 'Technology',
    'data science': 'Science',
    'machine learning': 'Science',
    'ai': 'Science',
    'artificial intelligence': 'Science',
    'paranormal romance': 'Paranormal',
    'fantasy romance': 'Fantasy',
    'historical romance': 'Historical Fiction',
    'contemporary romance': 'Romance',
    'erotic romance': 'Romance',
    'romantic suspense': 'Romance',
    'chick lit': 'Fiction',
    'womens fiction': 'Fiction',
    'literary fiction': 'Fiction',
    'classic literature': 'Classics',
    'classics': 'Classics',
    'graphic novels comics': 'Comics',
    'graphic novels': 'Comics',
    'comics': 'Comics',
    'manga': 'Comics',
    'politics': 'Political Science',
    'psychology': 'Psychology',
    'philosophy': 'Philosophy',
    'religion': 'Religion',
    'spirituality': 'Religion',
    'self help': 'Self-Help',
    'business': 'Business',
    'economics': 'Business',
    'history': 'History',
    'historical': 'History',
    'travel': 'Travel',
    'true crime': 'True Crime',
    'memoir': 'Biography',
    'biography memoir': 'Biography',
    'autobiography': 'Biography',
    'poetry': 'Poetry',
    'drama': 'Drama',
    'theatre': 'Drama',
    'art': 'Art',
    'music': 'Music',
    'cooking': 'Cooking',
    'food': 'Cooking',
    'sports': 'Sports',
    'education': 'Education',
    'reference': 'Reference',
    'language': 'Language',
    'mathematics': 'Mathematics',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'medicine': 'Medicine',
    'health': 'Health',
    'fitness': 'Health',
    'gardening': 'Gardening',
    'parenting': 'Parenting',
    'family': 'Parenting',
    'relationships': 'Relationships',
    'christian': 'Christian',
    'christian fiction': 'Christian',
    'christian living': 'Christian',
    'inspirational': 'Inspirational',
    'engineering': 'Engineering',
    'computer science': 'Technology',
    'design': 'Design',
    'architecture': 'Architecture',
    'law': 'Law',
    'mystery thriller': 'Mystery',
    'thriller': 'Thriller',
    'suspense': 'Thriller',
    'horror': 'Horror',
    'dystopia': 'Dystopian',
    'post apocalyptic': 'Dystopian',
    'apocalyptic': 'Dystopian',
    'time travel': 'Science Fiction',
    'alternate history': 'Science Fiction',
    'steampunk': 'Science Fiction',
    'cyberpunk': 'Science Fiction',
    'urban fantasy': 'Fantasy',
    'high fantasy': 'Fantasy',
    'epic fantasy': 'Fantasy',
    'dark fantasy': 'Fantasy',
    'magic': 'Fantasy',
    'witches': 'Fantasy',
    'wizards': 'Fantasy',
    'dragons': 'Fantasy',
    'fairies': 'Fantasy',
    'fae': 'Fantasy',
    'angels': 'Paranormal',
    'demons': 'Paranormal',
    'vampires': 'Paranormal',
    'werewolves': 'Paranormal',
    'shapeshifters': 'Paranormal',
    'ghosts': 'Paranormal',
    'zombies': 'Horror',
    'westerns': 'Western',
    'war': 'War',
    'military fiction': 'War',
    'adventure': 'Adventure',
    'action': 'Adventure',
    'short stories': 'Short Stories',
    'essays': 'Essays',
    'anthologies': 'Anthologies',
    'folklore': 'Folklore',
    'mythology': 'Mythology',
    'fairy tales': 'Fairy Tales',
    'legends': 'Mythology'
  };
  
  return variations[lowerCat] || null;
}

function parseCategories(categoriesStr) {
  if (!categoriesStr || categoriesStr === '[]') return ['Fiction'];
  
  try {
    let cats = [];
    if (categoriesStr.startsWith('[')) {
      cats = categoriesStr.replace(/[\[\]']/g, '').split(',').map(c => c.trim().replace(/^'|'$/g, ''));
    } else {
      cats = categoriesStr.split(',').map(c => c.trim());
    }
    
    // Map each category to allowed values and filter out nulls
    const mappedCats = cats
      .map(mapCategory)
      .filter(c => c && BOOK_CATEGORIES.includes(c));
    
    // Remove duplicates
    const uniqueCats = [...new Set(mappedCats)];
    
    // If no valid categories found, default to Fiction
    if (uniqueCats.length === 0) return ['Fiction'];
    
    // Limit to first 3 categories
    return uniqueCats.slice(0, 3);
  } catch (error) {
    console.log('Error parsing categories:', error.message);
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
        const categories = parseCategories(row.genres);
        
        const bookData = {
          isbn: row.isbn || '',
          isbn13: row.isbn || '',
          title: row.title || '',
          series: row.series || '',
          slug: generateSlug(row.title, row.isbn),
          authors: row.author ? row.author.split(',').map(a => a.trim()) : ['Unknown Author'],
          publisher: row.publisher || '',
          pages: row.pages ? parseInt(row.pages) : null,
          language: row.language || 'EN',
          description: row.description || '',
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
        
        await Book.create(bookData);
        imported++;
        
        if (imported % 5 === 0) {
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

importMissing();