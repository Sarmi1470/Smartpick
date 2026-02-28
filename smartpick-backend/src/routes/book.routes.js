const express = require('express');
const {
  getBookByISBN,
  compareBooks,
  searchBooks,
  getRandomBooks,
  getBooksByMood
} = require('../controllers/book.controller');

const router = express.Router();

router.get('/isbn/:isbn', getBookByISBN);
router.post('/compare', compareBooks);
router.get('/search', searchBooks);
router.get('/random', getRandomBooks);
router.get('/mood/:vibe', getBooksByMood);

module.exports = router;