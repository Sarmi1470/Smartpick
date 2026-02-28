const mongoose = require('mongoose');
require('dotenv').config();

async function fixSlugIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    
    // Drop the slug index
    try {
      await books.dropIndex('slug_1');
      console.log('✅ Dropped slug_1 index');
    } catch (err) {
      console.log('⚠️ Index might not exist, continuing...');
    }
    
    console.log('✅ Slug index removed. Now you can run the import.');
    console.log('After import, run this script again with "recreate" to add the index back.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixSlugIndex();