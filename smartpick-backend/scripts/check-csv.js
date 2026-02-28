const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'data', 'books.csv');  // note the '..'

if (fs.existsSync(csvPath)) {
  const stats = fs.statSync(csvPath);
  console.log(`✅ CSV file found at: ${csvPath}`);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Read first few lines
  const firstChunk = fs.readFileSync(csvPath, 'utf-8').split('\n').slice(0, 3);
  console.log('\n📝 First few lines:');
  firstChunk.forEach((line, i) => console.log(`Line ${i + 1}: ${line.substring(0, 100)}...`));
} else {
  console.log(`❌ CSV file NOT found at: ${csvPath}`);
  console.log('Current directory:', __dirname);
}