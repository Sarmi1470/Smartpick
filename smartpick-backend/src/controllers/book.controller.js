const bookService = require('../services/book.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { MOOD_VIBES, READING_DIFFICULTY } = require('../utils/constants');

/**
 * @desc    Get book by ISBN
 * @route   GET /api/books/isbn/:isbn
 * @access  Public
 */
const getBookByISBN = catchAsync(async (req, res) => {
  const { isbn } = req.params;
  
  // Clean and validate ISBN
  const cleanIsbn = isbn.replace(/[-\s]/g, '');
  if (!cleanIsbn.match(/^\d{10}|\d{13}$/)) {
    throw new AppError('Invalid ISBN format. Please enter a valid 10 or 13 digit ISBN.', 400);
  }

  const book = await bookService.findByISBN(cleanIsbn);

  // Format response for frontend
  const response = {
    success: true,
    message: '📖 Found your book!',
    data: {
      id: book._id,
      isbn: book.isbn,
      title: book.title,
      authors: book.authorList, // Use virtual
      coverImage: book.coverImage?.medium || book.coverImage?.thumbnail || null,
      coverColor: book.coverColor,
      publishedYear: book.publishedYear,
      pages: book.pages,
      readingTime: book.readingTime, // Virtual field
      
      // SmartPick enriched data (if available)
      summary: book.summary || book.description?.substring(0, 200) + '...',
      moodVibes: book.moodVibes || [],
      readingDifficulty: book.readingDifficulty,
      perfectFor: book.perfectFor || [],
      
      // Additional metadata
      categories: book.categories,
      ratings: book.ratings,
      
      // AI status
      aiEnriched: book.aiEnriched
    }
  };

  // Add playful tone based on AI enrichment
  if (!book.aiEnriched) {
    response.message = '📚 Found it! Ask me what it\'s really about though...';
  }

  res.status(200).json(response);
});

/**
 * @desc    Get multiple books by ISBNs (for comparison)
 * @route   POST /api/books/compare
 * @access  Public
 */
const compareBooks = catchAsync(async (req, res) => {
  const { isbns } = req.body;

  if (!isbns || !Array.isArray(isbns) || isbns.length < 2) {
    throw new AppError('Please provide at least 2 ISBNs to compare', 400);
  }

  if (isbns.length > 5) {
    throw new AppError('You can compare up to 5 books at a time (we don\'t want to overwhelm you!)', 400);
  }

  const books = await bookService.findByISBNs(isbns);

  if (books.length === 0) {
    throw new AppError('No books found with those ISBNs. Double-check your scans?', 404);
  }

  if (books.length < isbns.length) {
    const foundIsbns = books.map(b => b.isbn || b.isbn13);
    const missingCount = isbns.length - books.length;
    
    return res.status(207).json({
      success: true,
      message: `📚 Found ${books.length} of your ${isbns.length} books. The other ${missingCount} might need a rescan.`,
      data: {
        books: books.map(book => ({
          id: book._id,
          title: book.title,
          authors: book.authorList,
          coverImage: book.coverImage?.thumbnail,
          coverColor: book.coverColor,
          publishedYear: book.publishedYear,
          pages: book.pages,
          moodVibes: book.moodVibes || [],
          readingDifficulty: book.readingDifficulty
        })),
        missingIsbns: isbns.filter(isbn => 
          !books.some(b => b.isbn === isbn || b.isbn13 === isbn)
        )
      }
    });
  }

  // All books found
  res.status(200).json({
    success: true,
    message: `✅ Got all ${books.length} books! Ready to compare them?`,
    data: {
      books: books.map(book => ({
        id: book._id,
        title: book.title,
        authors: book.authorList,
        coverImage: book.coverImage?.medium,
        coverColor: book.coverColor,
        publishedYear: book.publishedYear,
        pages: book.pages,
        readingTime: book.readingTime,
        categories: book.categories,
        moodVibes: book.moodVibes || [],
        readingDifficulty: book.readingDifficulty
      }))
    }
  });
});

/**
 * @desc    Search books
 * @route   GET /api/books/search
 * @access  Public
 */
const searchBooks = catchAsync(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.length < 2) {
    throw new AppError('Please enter at least 2 characters to search', 400);
  }

  const result = await bookService.searchBooks(q, { page, limit });

  if (result.books.length === 0) {
    return res.status(200).json({
      success: true,
      message: `🔍 No books found matching "${q}". Try a different search?`,
      data: {
        books: [],
        pagination: result.pagination
      }
    });
  }

  res.status(200).json({
    success: true,
    message: result.books.length === 1 
      ? `📖 Found 1 book matching "${q}"` 
      : `📚 Found ${result.books.length} books matching "${q}"`,
    data: {
      books: result.books.map(book => ({
        id: book._id,
        title: book.title,
        authors: book.authorList,
        coverImage: book.coverImage?.thumbnail,
        coverColor: book.coverColor,
        publishedYear: book.publishedYear,
        readingDifficulty: book.readingDifficulty
      })),
      pagination: result.pagination
    }
  });
});

/**
 * @desc    Get random books (Surprise Me feature)
 * @route   GET /api/books/random
 * @access  Public
 */
const getRandomBooks = catchAsync(async (req, res) => {
  const { count = 3 } = req.query;
  
  const books = await bookService.getRandomBooks(parseInt(count));

  res.status(200).json({
    success: true,
    message: '🎲 Here are some random picks for you!',
    data: {
      books: books.map(book => ({
        id: book._id,
        title: book.title,
        authors: book.authorList,
        coverImage: book.coverImage?.medium,
        coverColor: book.coverColor,
        summary: book.summary || book.description?.substring(0, 150) + '...',
        readingDifficulty: book.readingDifficulty,
        moodVibes: book.moodVibes || []
      }))
    }
  });
});

/**
 * @desc    Get books by mood vibe
 * @route   GET /api/books/mood/:vibe
 * @access  Public
 */
const getBooksByMood = catchAsync(async (req, res) => {
  const { vibe } = req.params;
  
  // Validate mood
  if (!Object.values(MOOD_VIBES).includes(vibe)) {
    throw new AppError(`Mood must be one of: ${Object.values(MOOD_VIBES).join(', ')}`, 400);
  }

  const books = await Book.find({ moodVibes: vibe, isActive: true })
    .limit(20)
    .sort({ 'ratings.average': -1 });

  res.status(200).json({
    success: true,
    message: `✨ Books with a ${vibe} vibe`,
    data: {
      books: books.map(book => ({
        id: book._id,
        title: book.title,
        authors: book.authorList,
        coverImage: book.coverImage?.thumbnail,
        coverColor: book.coverColor,
        readingDifficulty: book.readingDifficulty
      }))
    }
  });
});

module.exports = {
  getBookByISBN,
  compareBooks,
  searchBooks,
  getRandomBooks,
  getBooksByMood
};