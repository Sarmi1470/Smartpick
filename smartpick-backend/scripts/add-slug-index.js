const mongoose = require('mongoose');
require('dotenv').config();

async function addSlugIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    
    // Create the slug index with unique: false to allow duplicates
    await books.createIndex({ slug: 1 }, { unique: false });
    console.log('✅ Created slug index (non-unique)');
    
    const indexes = await books.indexes();
    console.log('\n📊 Current indexes:');
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addSlugIndex();
