const mongoose = require('mongoose');
require('dotenv').config();

async function checkMissing() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const books = db.collection('books');
    
    console.log('✅ Connected to MongoDB');
    
    const totalBooks = await books.countDocuments();
    console.log(`\n📚 Total books in database: ${totalBooks}`);
    
    // Check for missing required fields
    const missingIsbn = await books.countDocuments({ 
      $or: [
        { isbn: { $in: [null, ''] } },
        { isbn13: { $in: [null, ''] } }
      ]
    });
    
    const missingTitle = await books.countDocuments({ title: { $in: [null, ''] } });
    const missingAuthors = await books.countDocuments({ authors: { $size: 0 } });
    
    console.log('\n📊 Missing fields:');
    console.log(`   Missing ISBN: ${missingIsbn}`);
    console.log(`   Missing Title: ${missingTitle}`);
    console.log(`   Missing Authors: ${missingAuthors}`);
    
    // Check for books that might have failed validation
    const failedValidation = await books.countDocuments({
      $or: [
        { isbn: { $in: [null, ''] } },
        { title: { $in: [null, ''] } },
        { authors: { $size: 0 } }
      ]
    });
    
    console.log(`\n⚠️ Books that failed validation: ${failedValidation}`);
    
    // Show a sample of books that might have issues
    const problemBooks = await books.find({
      $or: [
        { isbn: { $in: [null, ''] } },
        { title: { $in: [null, ''] } }
      ]
    }).limit(5).toArray();
    
    if (problemBooks.length > 0) {
      console.log('\n📖 Sample problem books:');
      problemBooks.forEach((book, i) => {
        console.log(`\n${i + 1}. Title: ${book.title || 'NO TITLE'}`);
        console.log(`   ISBN: ${book.isbn || 'NO ISBN'}`);
      });
    } else {
      console.log('\n✅ No validation issues found in database!');
    }
    
    // Check if we have 52,478 books
    if (totalBooks === 52478) {
      console.log('\n🎉 SUCCESS! All 52,478 books are in the database!');
    } else {
      console.log(`\n⚠️ Missing ${52478 - totalBooks} books from the total`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkMissing();