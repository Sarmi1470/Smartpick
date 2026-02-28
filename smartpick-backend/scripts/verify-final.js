const mongoose = require('mongoose');
require('dotenv').config();

async function verifyFinal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    
    const totalBooks = await books.countDocuments();
    console.log(`\n📚 Total books in database: ${totalBooks}`);
    
    // Check for duplicates
    const duplicates = await books.aggregate([
      {
        $group: {
          _id: '$slug',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate slugs found!');
    } else {
      console.log(`⚠️ Found ${duplicates.length} duplicate slugs`);
    }
    
    // Show sample books
    const sample = await books.find().limit(3).toArray();
    console.log('\n📖 Sample books:');
    sample.forEach((book, i) => {
      console.log(`\n${i + 1}. ${book.title}`);
      console.log(`   Author: ${book.authors?.[0] || 'N/A'}`);
      console.log(`   Slug: ${book.slug}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyFinal();