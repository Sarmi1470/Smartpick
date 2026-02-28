const Book = require('../models/Book.model');
const AppError = require('../utils/AppError');

class BookService {
  /**
   * Find book by ISBN (supports both ISBN-10 and ISBN-13)
   */
  async findByISBN(isbn) {
    // Clean ISBN (remove hyphens and spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    // Search in both ISBN fields
    const book = await Book.findOne({
      $or: [
        { isbn: cleanIsbn },
        { isbn13: cleanIsbn }
      ]
    });

    if (!book) {
      throw new AppError('Book not found with that ISBN', 404);
    }

    return book;
  }

  /**
   * Find multiple books by ISBNs
   */
  async findByISBNs(isbns) {
    const cleanIsbns = isbns.map(isbn => isbn.replace(/[-\s]/g, ''));
    
    const books = await Book.find({
      $or: [
        { isbn: { $in: cleanIsbns } },
        { isbn13: { $in: cleanIsbns } }
      ]
    });

    return books;
  }

  /**
   * Search books by title, author, or category
   */
  async searchBooks(query, options = {}) {
    const {
      limit = 20,
      page = 1,
      sortBy = 'ratings.average',
      sortOrder = -1
    } = options;

    const skip = (page - 1) * limit;

    // Build search filter
    const filter = {};
    
    if (query) {
      filter.$text = { $search: query };
    }

    const books = await Book.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(filter);

    return {
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get random books for "Surprise Me" feature
   */
  async getRandomBooks(count = 3) {
    const books = await Book.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: count } }
    ]);

    return books;
  }

  /**
   * Get books by category with optional filtering
   */
  async getBooksByCategory(category, options = {}) {
    const {
      limit = 20,
      page = 1,
      difficulty = null
    } = options;

    const filter = { categories: category };
    
    if (difficulty) {
      filter.readingDifficulty = difficulty;
    }

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    return books;
  }

  /**
   * Enrich book with AI-generated fields
   */
  async enrichBookWithAI(bookId, aiData) {
    const book = await Book.findById(bookId);
    
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Update with AI-enriched data
    book.summary = aiData.summary || book.summary;
    book.readingDifficulty = aiData.readingDifficulty || book.readingDifficulty;
    book.moodVibes = aiData.moodVibes || book.moodVibes;
    book.perfectFor = aiData.perfectFor || book.perfectFor;
    book.aiEnriched = true;
    book.aiLastEnriched = new Date();
    book.aiConfidence = aiData.confidence || 0.8;

    await book.save();
    
    return book;
  }

  /**
   * Get similar books based on categories and tags
   */
  async getSimilarBooks(bookId, limit = 5) {
    const book = await Book.findById(bookId);
    
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    const similarBooks = await Book.find({
      _id: { $ne: book._id },
      $or: [
        { categories: { $in: book.categories } },
        { tags: { $in: book.tags || [] } }
      ],
      isActive: true
    })
      .limit(limit)
      .sort({ 'ratings.average': -1 });

    return similarBooks;
  }
}

module.exports = new BookService();