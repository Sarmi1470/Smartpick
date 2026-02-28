const express = require('express');
const {
  startComparison,
  submitAnswer,
  startSurpriseQuiz,
  getQuizResults
} = require('../controllers/quiz.controller');

const router = express.Router();

// Comparison quiz routes
router.post('/compare/start', startComparison);
router.post('/:sessionId/answer', submitAnswer);
router.get('/:sessionId/results', getQuizResults);

// Surprise me routes
router.post('/surprise/start', startSurpriseQuiz);

module.exports = router;