const mongoose = require('mongoose');

const quizSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Scanned books for comparison
  scannedBooks: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    isbn: String,
    scannedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Quiz state
  quizType: {
    type: String,
    enum: ['comparison', 'surprise', 'single'],
    required: true
  },
  
  currentStep: {
    type: Number,
    default: 0
  },
  
  questions: [{
    question: String,
    options: [String],
    userAnswer: String,
    answeredAt: Date
  }],
  
  // Results
  results: {
    recommendation: {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
      },
      confidence: Number,
      explanation: String
    },
    personalityProfile: {
      type: mongoose.Schema.Types.Mixed  // AI-generated profile
    },
    alternatives: [{
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
      },
      reason: String
    }]
  },
  
  // Metadata
  userAgent: String,
  ipAddress: String,
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Expiry (clean up old sessions)
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days
  }
}, {
  timestamps: true
});

// Auto-delete expired sessions
quizSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

module.exports = QuizSession;