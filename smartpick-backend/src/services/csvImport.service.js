const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Add this for random generation
const csv = require('csv-parser');
const Book = require('../models/Book.model');
const { READING_DIFFICULTY, MOOD_VIBES } = require('../utils/constants');

class CSVImportService {
  constructor() {
    this.stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };
    // Track slugs used in current batch to prevent duplicates
    this.batchSlugs = new Set();
  }

  /**
   * Generate a URL-friendly slug from a string with guaranteed uniqueness
   */
  generateSlug(str, isbn = '', index = 0) {
    if (!str || str.trim() === '') {
      // If no title, generate a random slug with ISBN if available
      const uniqueId = crypto.randomBytes(4).toString('hex');
      return isbn ? `book-${isbn}-${uniqueId}` : `book-${uniqueId}`;
    }
    
    // Create base slug from title
    let baseSlug = str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Truncate base slug to leave room for suffixes
    const maxBaseLength = 70; // Reduced from 80 to leave more room for suffixes
    baseSlug = baseSlug.substring(0, maxBaseLength);
    
    // Start with ISBN suffix if available (most reliable unique identifier)
    if (isbn && isbn.trim()) {
      // Clean ISBN and take last 8 characters
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').slice(-8);
      if (cleanIsbn) {
        const slug = `${baseSlug}-${cleanIsbn}`.substring(0, 100);
        
        // Check for common duplicate patterns (like -00, -000, etc.)
        // If the slug ends with a pattern that might cause duplicates, add the index
        if (slug.match(/-\d{1,2}$/) && this.batchSlugs.has(slug)) {
          return `${baseSlug}-${cleanIsbn}-${index}`.substring(0, 100);
        }
        return slug;
      }
    }
    
    // If no ISBN, add timestamp + random string + index for extra uniqueness
    const timestamp = Date.now().toString(36).slice(-6);
    const randomStr = crypto.randomBytes(3).toString('hex');
    return `${baseSlug}-${timestamp}-${randomStr}-${index}`.substring(0, 100);
  }

  /**
   * Ensure slug is unique within the current batch
   */
  getUniqueSlug(title, isbn = '', rowIndex) {
    let slug = this.generateSlug(title, isbn, rowIndex);
    let counter = 1;
    const originalSlug = slug;
    const baseSlug = title ? title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 50) : 'book';
    
    // Check if slug already exists in current batch
    while (this.batchSlugs.has(slug)) {
      // Add counter to make it unique
      slug = `${originalSlug}-${counter}`;
      counter++;
      
      // If still too long or counter gets too high, use a hash approach
      if (slug.length > 100 || counter > 10) {
        const hash = crypto.createHash('md5')
          .update(title + isbn + Date.now() + counter + Math.random())
          .digest('hex')
          .substring(0, 12);
        slug = `${baseSlug}-${hash}`.substring(0, 100);
      }
    }
    
    // Add to batch tracking
    this.batchSlugs.add(slug);
    return slug;
  }

  /**
   * Map CSV columns to our schema
   * Adjust this based on your Kaggle dataset structure
   */
  mapCSVToBookSchema(row, rowIndex) {
    // Extract price as number (remove currency symbol if present)
    let price = 0;
    if (row.price) {
      const priceMatch = row.price.toString().match(/[\d.]+/);
      price = priceMatch ? parseFloat(priceMatch[0]) : 0;
    }

    // Parse rating by stars
    let ratingsByStars = [];
    if (row.ratingsByStars) {
      try {
        // Remove brackets and split
        const starsStr = row.ratingsByStars.replace(/[\[\]']/g, '');
        ratingsByStars = starsStr.split(',').map(r => parseInt(r.trim())).filter(n => !isNaN(n));
      } catch (e) {
        ratingsByStars = [];
      }
    }

    // Parse genres/categories - handle both string and already parsed formats
    let categories = ['Fiction'];
    if (row.genres) {
      try {
        if (row.genres.startsWith('[')) {
          const genresStr = row.genres.replace(/[\[\]']/g, '');
          categories = genresStr.split(',').map(g => g.trim().replace(/^'|'$/g, '')).filter(g => g);
        } else {
          categories = row.genres.split(',').map(g => g.trim());
        }
      } catch (e) {
        categories = ['Fiction'];
      }
    }

    // Parse characters
    let characters = [];
    if (row.characters) {
      try {
        if (row.characters.startsWith('[')) {
          const charsStr = row.characters.replace(/[\[\]']/g, '');
          characters = charsStr.split(',').map(c => c.trim().replace(/^'|'$/g, '')).filter(c => c);
        } else {
          characters = row.characters.split(',').map(c => c.trim());
        }
      } catch (e) {
        characters = [];
      }
    }

    // Parse awards
    let awards = [];
    if (row.awards) {
      try {
        if (row.awards.startsWith('[')) {
          const awardsStr = row.awards.replace(/[\[\]']/g, '');
          awards = awardsStr.split(',').map(a => a.trim().replace(/^'|'$/g, '')).filter(a => a);
        } else {
          awards = row.awards.split(',').map(a => a.trim());
        }
      } catch (e) {
        awards = [];
      }
    }

    // Parse settings
    let settings = [];
    if (row.setting) {
      try {
        if (row.setting.startsWith('[')) {
          const settingsStr = row.setting.replace(/[\[\]']/g, '');
          settings = settingsStr.split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(s => s);
        } else {
          settings = row.setting.split(',').map(s => s.trim());
        }
      } catch (e) {
        settings = [];
      }
    }

    // Parse publish date
    let publishDate = null;
    if (row.publishDate) {
      const dateParts = row.publishDate.split('/');
      if (dateParts.length === 3) {
        // Format: MM/DD/YY
        const month = parseInt(dateParts[0]);
        const day = parseInt(dateParts[1]);
        let year = parseInt(dateParts[2]);
        if (year < 100) year += 2000; // Convert 2-digit year to 4-digit
        publishDate = new Date(year, month - 1, day);
      }
    }

    // Parse first publish date
    let firstPublishDate = null;
    if (row.firstPublishDate) {
      const dateParts = row.firstPublishDate.split('/');
      if (dateParts.length === 3) {
        const month = parseInt(dateParts[0]);
        const day = parseInt(dateParts[1]);
        let year = parseInt(dateParts[2]);
        if (year < 100) year += 2000;
        firstPublishDate = new Date(year, month - 1, day);
      }
    }

    // Get ISBN for slug generation
    const isbn = row.isbn || '';

    // Generate unique slug with batch tracking
    const slug = this.getUniqueSlug(row.title, isbn, rowIndex);

    return {
      isbn: isbn,
      isbn13: isbn, // Using isbn as isbn13 since you only have one ISBN column
      
      // Book identification
      bookId: row.bookId || '',
      title: row.title || '',
      series: row.series || '',
      
      // Generate slug from title and ISBN
      slug: slug,
      
      // Author handling - split by comma if multiple authors
      authors: row.author 
        ? row.author.split(',').map(a => a.trim())
        : ['Unknown Author'],
      
      // Publishing info
      publisher: row.publisher || '',
      publishDate: publishDate,
      firstPublishDate: firstPublishDate,
      edition: row.edition || '',
      bookFormat: row.bookFormat || '',
      
      // Book details
      pages: row.pages ? parseInt(row.pages) : null,
      // Set language to English by default to avoid MongoDB language validation issues
      language: 'English',
      description: row.description || '',
      
      // Genres/categories
      categories: categories,
      
      // Characters
      characters: characters,
      
      // Awards
      awards: awards,
      
      // Setting
      setting: settings,
      
      // Cover image
      coverImage: {
        small: row.coverImg || '',
        medium: row.coverImg || '',
        large: row.coverImg || '',
        thumbnail: row.coverImg || ''
      },
      
      // Ratings
      ratings: {
        average: row.rating ? parseFloat(row.rating) : 0,
        count: row.numRatings ? parseInt(row.numRatings) : 0,
        distribution: ratingsByStars.length === 5 ? {
          1: ratingsByStars[4] || 0,
          2: ratingsByStars[3] || 0,
          3: ratingsByStars[2] || 0,
          4: ratingsByStars[1] || 0,
          5: ratingsByStars[0] || 0
        } : undefined,
        byStars: row.ratingsByStars || '',
        likedPercent: row.likedPercent ? parseInt(row.likedPercent) : 0
      },
      
      // Additional metrics
      bbeScore: row.bbeScore ? parseInt(row.bbeScore) : 0,
      bbeVotes: row.bbeVotes ? parseInt(row.bbeVotes) : 0,
      price: price,
      
      source: 'kaggle',
      importId: Date.now().toString()
    };
  }

  /**
   * Validate book data before import
   */
  validateBook(bookData) {
    const errors = [];
    
    if (!bookData.isbn && !bookData.isbn13) {
      errors.push('Missing ISBN');
    }
    
    if (!bookData.title) {
      errors.push('Missing title');
    }
    
    if (!bookData.authors || bookData.authors.length === 0) {
      errors.push('Missing authors');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Import books from CSV file
   */
  async importFromCSV(filePath, options = {}) {
    const {
      clearExisting = false,
      batchSize = 100,
      onProgress = null
    } = options;

    console.log(`📚 Starting CSV import from: ${filePath}`);
    
    // Clear existing if requested
    if (clearExisting) {
      await Book.deleteMany({ source: 'kaggle' });
      console.log('🗑️ Cleared existing Kaggle books');
    }

    // Reset stats and batch tracking
    this.stats = {
      total: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };
    this.batchSlugs.clear();

    return new Promise((resolve, reject) => {
      const batch = [];
      let processedCount = 0;
      let rowIndex = 0;

      const stream = fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          processedCount++;
          rowIndex++;
          batch.push({ row, index: rowIndex });
          
          // Process in batches
          if (batch.length >= batchSize) {
            // Pause the stream
            stream.pause();
            
            // Process the batch
            await this.processBatch(batch, processedCount, onProgress);
            
            // Clear batch and resume
            batch.length = 0;
            stream.resume();
          }
        })
        .on('end', async () => {
          // Process remaining records
          if (batch.length > 0) {
            await this.processBatch(batch, processedCount, onProgress);
          }
          
          // Final statistics
          const failedCount = this.stats.errors.length;
          const firstErrors = this.stats.errors.slice(0, 10);
          
          console.log(`
📊 Import Complete!
━━━━━━━━━━━━━━━━━
📚 Total processed: ${this.stats.total}
✅ Imported: ${this.stats.imported}
⏭️ Skipped: ${this.stats.skipped}
❌ Failed: ${failedCount}
━━━━━━━━━━━━━━━━━
          `);

          if (failedCount > 0) {
            console.log(`
⚠️ First ${Math.min(10, failedCount)} errors:`);
            firstErrors.forEach((error, i) => {
              console.log(`  ${i+1}. ISBN: ${error.isbn || 'unknown'} - Errors: ${error.error || error.errors?.join(', ')}`);
            });
          }
          
          resolve(this.stats);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Process a batch of CSV rows
   */
  async processBatch(batch, totalProcessed, onProgress) {
    const operations = [];
    const failedInBatch = [];
    
    // Clear batch slugs for new batch
    this.batchSlugs.clear();
    
    for (const { row, index } of batch) {
      this.stats.total++;
      
      try {
        // Map CSV to schema
        const bookData = this.mapCSVToBookSchema(row, index);
        
        // Validate
        const validation = this.validateBook(bookData);
        if (!validation.isValid) {
          this.stats.skipped++;
          this.stats.errors.push({
            isbn: bookData.isbn || 'unknown',
            title: bookData.title || 'unknown',
            errors: validation.errors
          });
          continue;
        }

        // Prepare for upsert (update if exists, insert if not)
        const filter = {
          $or: [
            { isbn: bookData.isbn },
            { isbn13: bookData.isbn13 }
          ].filter(condition => Object.values(condition)[0]) // Remove empty conditions
        };

        // If no valid filter, skip
        if (filter.$or.length === 0) {
          this.stats.skipped++;
          continue;
        }

        operations.push({
          updateOne: {
            filter,
            update: { $set: bookData },
            upsert: true
          }
        });

      } catch (error) {
        failedInBatch.push({
          isbn: row.isbn || 'unknown',
          error: error.message
        });
      }
    }

    // Execute batch operations
    if (operations.length > 0) {
      try {
        // Use ordered: false to continue even if some operations fail
        const result = await Book.bulkWrite(operations, { ordered: false });
        this.stats.imported += (result.upsertedCount || 0) + (result.modifiedCount || 0);
        
        // Check for write errors in the result
        if (result.result && result.result.writeErrors) {
          result.result.writeErrors.forEach(error => {
            failedInBatch.push({
              isbn: 'unknown',
              error: error.errmsg || 'Write error'
            });
          });
        }
        
      } catch (error) {
        // Handle bulk write errors
        console.error('Batch insert error:', error.message);
        
        if (error.writeErrors) {
          error.writeErrors.forEach(writeError => {
            failedInBatch.push({
              isbn: 'unknown',
              error: writeError.errmsg || 'Write error'
            });
          });
        } else {
          failedInBatch.push({
            isbn: 'unknown',
            error: error.message
          });
        }
      }
    }

    // Record failed operations
    failedInBatch.forEach(failure => {
      this.stats.failed++;
      this.stats.errors.push(failure);
    });

    // Progress update
    if (onProgress) {
      onProgress({
        processed: totalProcessed,
        imported: this.stats.imported,
        total: this.stats.total,
        failed: this.stats.failed
      });
    } else {
      // Default progress logging
      const percent = ((totalProcessed / 52478) * 100).toFixed(1);
      console.log(`📊 Progress: ${totalProcessed}/52478 rows (${percent}%) - ${this.stats.imported} imported`);
    }
  }

  /**
   * Get import statistics
   */
  getStats() {
    return this.stats;
  }
}

module.exports = new CSVImportService();