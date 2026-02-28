const { BOOK_CATEGORIES } = require('../src/utils/constants');

console.log('📚 Available BOOK_CATEGORIES:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
BOOK_CATEGORIES.forEach((cat, index) => {
  console.log(`${index + 1}. ${cat}`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Total categories: ${BOOK_CATEGORIES.length}`);