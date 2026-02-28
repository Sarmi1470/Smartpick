const mongoose = require('mongoose');
require('dotenv').config();

async function verifyImport() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    
    // Get total count
    const count = await books.countDocuments();
    console.log(`\n📚 Total books in database: ${count}`);
    
    if (count > 0) {
      // Get sample of first 5 books
      const sample = await books.find().limit(5).toArray();
      console.log('\n📖 Sample books:');
      sample.forEach((book, i) => {
        console.log(`\n${i + 1}. ${book.title}`);
        console.log(`   Author: ${book.authors?.[0] || 'N/A'}`);
        console.log(`   ISBN: ${book.isbn}`);
        console.log(`   Rating: ${book.ratings?.average}/5 (${book.ratings?.count} ratings)`);
        console.log(`   Categories: ${book.categories?.slice(0, 3).join(', ')}...`);
      });
      
      // Check indexes
      const indexes = await books.indexes();
      console.log('\n📊 Indexes:', indexes.map(idx => idx.name).join(', '));
      
      // Test ISBN lookup
      if (sample[0]?.isbn) {
        const start = Date.now();
        const found = await books.findOne({ isbn: sample[0].isbn });
        const time = Date.now() - start;
        console.log(`\n⚡ ISBN lookup time: ${time}ms`);
      }
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyImport();