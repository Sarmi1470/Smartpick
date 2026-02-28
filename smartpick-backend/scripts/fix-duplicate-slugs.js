const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const Book = require('../src/models/Book.model');

async function fixDuplicates() {
  await connectDB();
  
  // Find books with duplicate slugs
  const duplicates = await Book.aggregate([
    { $group: { _id: "$slug", count: { $sum: 1 }, ids: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  for (const dup of duplicates) {
    // Keep first, append numbers to others
    const [first, ...rest] = dup.ids;
    
    for (let i = 0; i < rest.length; i++) {
      await Book.findByIdAndUpdate(rest[i], { 
        slug: `${dup._id}-${i + 2}` 
      });
    }
  }
  
  console.log(`✅ Fixed ${duplicates.length} duplicate groups`);
  process.exit(0);
}

fixDuplicates();