const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    console.log('Creating indexes for better performance...');
    
    // Create indexes
    await books.createIndex({ isbn: 1 }, { unique: true, sparse: true });
    await books.createIndex({ title: 1 });
    await books.createIndex({ authors: 1 });
    await books.createIndex({ 'ratings.average': -1 });
    await books.createIndex({ 'ratings.count': -1 });
    await books.createIndex({ categories: 1 });
    await books.createIndex({ publishDate: -1 });
    
    const indexes = await books.indexes();
    console.log('\n✅ Indexes created:', indexes.map(idx => idx.name).join(', '));
    
  } catch (error) {
    console.error('❌ Failed to create indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createIndexes();