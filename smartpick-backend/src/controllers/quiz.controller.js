const QuizSession = require('../models/QuizSession.model');
const bookService = require('../services/book.service');
const aiService = require('../services/ai.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Create a new comparison session
 * @route   POST /api/quiz/compare/start
 * @access  Public
 */
const startComparison = catchAsync(async (req, res) => {
  const { isbns } = req.body;

  if (!isbns || !Array.isArray(isbns) || isbns.length < 2) {
    throw new AppError('Please provide at least 2 ISBNs to compare', 400);
  }

  // Get book details
  const books = await bookService.findByISBNs(isbns);
  
  if (books.length === 0) {
    throw new AppError('No books found with those ISBNs', 404);
  }

  // Create quiz session
  const sessionId = uuidv4();
  const session = await QuizSession.create({
    sessionId,
    quizType: 'comparison',
    scannedBooks: books.map(book => ({
      bookId: book._id,
      isbn: book.isbn || book.isbn13
    }))
  });

  // Generate questions via AI service
  const questions = await aiService.generateComparisonQuestions(books);

  // Store questions in session
  session.questions = questions.map(q => ({
    question: q.text,
    options: q.options
  }));
  await session.save();

  res.status(201).json({
    success: true,
    message: '🤔 Let\'s figure out which book is really for you...',
    data: {
      sessionId: session.sessionId,
      totalQuestions: questions.length,
      currentQuestion: 0,
      books: books.map(book => ({
        id: book._id,
        title: book.title,
        authors: book.authorList,
        coverImage: book.coverImage?.thumbnail
      })),
      questions: questions.map((q, index) => ({
        id: index,
        text: q.text,
        options: q.options
      }))
    }
  });
});

/**
 * @desc    Submit answer and get next question
 * @route   POST /api/quiz/:sessionId/answer
 * @access  Public
 */
const submitAnswer = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const { questionId, answer } = req.body;

  const session = await QuizSession.findOne({ sessionId });
  
  if (!session) {
    throw new AppError('Quiz session not found. Start over?', 404);
  }

  if (session.completed) {
    throw new AppError('This quiz is already completed!', 400);
  }

  // Store answer
  session.questions[questionId].userAnswer = answer;
  session.questions[questionId].answeredAt = new Date();
  session.currentStep = questionId + 1;

  // Check if quiz is complete
  if (session.currentStep >= session.questions.length) {
    // Get all books for scoring
    const books = await Book.find({ 
      _id: { $in: session.scannedBooks.map(b => b.bookId) } 
    });

    // Get AI to analyze answers and recommend
    const analysis = await aiService.analyzeComparison({
      books,
      answers: session.questions
    });

    // Store results
    session.results = {
      recommendation: {
        bookId: analysis.recommendation.bookId,
        confidence: analysis.confidence,
        explanation: analysis.explanation
      },
      alternatives: analysis.alternatives
    };
    session.completed = true;
    session.completedAt = new Date();
    
    await session.save();

    return res.status(200).json({
      success: true,
      message: '🎉 I know which book is perfect for you!',
      data: {
        completed: true,
        recommendation: {
          book: books.find(b => b._id.toString() === analysis.recommendation.bookId.toString()),
          confidence: analysis.confidence,
          explanation: analysis.explanation,
          alternatives: analysis.alternatives
        }
      }
    });
  }

  await session.save();

  // Return next question
  res.status(200).json({
    success: true,
    message: `Question ${session.currentStep + 1} of ${session.questions.length}`,
    data: {
      sessionId: session.sessionId,
      currentQuestion: session.currentStep,
      totalQuestions: session.questions.length,
      nextQuestion: {
        id: session.currentStep,
        text: session.questions[session.currentStep].question,
        options: session.questions[session.currentStep].options
      }
    }
  });
});

/**
 * @desc    Start a "Surprise Me" quiz
 * @route   POST /api/quiz/surprise/start
 * @access  Public
 */
const startSurpriseQuiz = catchAsync(async (req, res) => {
  const sessionId = uuidv4();
  
  // Get random books for potential recommendations
  const randomBooks = await bookService.getRandomBooks(10);

  // AI generates personalized questions
  const questions = await aiService.generatePersonalityQuestions();

  const session = await QuizSession.create({
    sessionId,
    quizType: 'surprise',
    questions: questions.map(q => ({
      question: q.text,
      options: q.options
    }))
  });

  res.status(201).json({
    success: true,
    message: '🎲 Let\'s find you a surprise read!',
    data: {
      sessionId: session.sessionId,
      totalQuestions: questions.length,
      currentQuestion: 0,
      questions: questions.map((q, index) => ({
        id: index,
        text: q.text,
        options: q.options
      }))
    }
  });
});

/**
 * @desc    Get quiz results
 * @route   GET /api/quiz/:sessionId/results
 * @access  Public
 */
const getQuizResults = catchAsync(async (req, res) => {
  const { sessionId } = req.params;

  const session = await QuizSession.findOne({ sessionId })
    .populate('results.recommendation.bookId')
    .populate('results.alternatives.bookId');

  if (!session) {
    throw new AppError('Quiz session not found', 404);
  }

  if (!session.completed) {
    return res.status(200).json({
      success: true,
      message: 'Quiz still in progress',
      data: {
        completed: false,
        currentQuestion: session.currentStep,
        totalQuestions: session.questions.length
      }
    });
  }

  // Format response with Dark Academia warmth
  res.status(200).json({
    success: true,
    message: '📜 Your reading destiny awaits...',
    data: {
      completed: true,
      personalityProfile: session.results.personalityProfile || {
        type: 'Thoughtful Explorer',
        description: 'You appreciate depth over speed, meaning over trend.'
      },
      recommendation: {
        book: session.results.recommendation.bookId,
        confidence: Math.round(session.results.recommendation.confidence * 100) + '%',
        explanation: session.results.recommendation.explanation
      },
      alternatives: session.results.alternatives?.map(alt => ({
        book: alt.bookId,
        reason: alt.reason
      }))
    }
  });
});

module.exports = {
  startComparison,
  submitAnswer,
  startSurpriseQuiz,
  getQuizResults
};