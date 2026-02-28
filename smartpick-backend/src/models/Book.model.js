const mongoose = require('mongoose');
const slugify = require('slugify');
const { READING_DIFFICULTY, MOOD_VIBES, BOOK_CATEGORIES } = require('../utils/constants');

const bookSchema = new mongoose.Schema({
  // Core Identification
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true // For fast lookup during scanning
  },
  isbn13: {
    type: String,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    unique: true
  },
  
  // Authors & Contributors
  authors: [{
    type: String,
    required: [true, 'At least one author is required'],
    trim: true
  }],
  publisher: {
    type: String,
    trim: true
  },
  
  // Publication Details
  publishedDate: {
    type: Date
  },
  publishedYear: {
    type: Number
  },
  language: {
    type: String,
    default: 'en',
    uppercase: true
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  
  // Classification
  categories: [{
    type: String,
    enum: BOOK_CATEGORIES
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Content
  description: {
    type: String,
    trim: true
  },
  summary: {
    type: String,
    trim: true  // AI-generated summary will go here
  },
  
  // SmartPick Enrichment Fields
  readingDifficulty: {
    type: String,
    enum: Object.values(READING_DIFFICULTY),
    default: READING_DIFFICULTY.INTERMEDIATE
  },
  moodVibes: [{
    type: String,
    enum: Object.values(MOOD_VIBES)
  }],
  perfectFor: [{
    type: String,  // e.g., "Fans of dense philosophy", "Quick weekend readers"
    trim: true
  }],
  
  // Cover & Media
  coverImage: {
    small: String,
    medium: String,
    large: String,
    thumbnail: String
  },
  coverColor: {
    type: String,  // Dominant cover color for UI accent
    default: '#F59E0B'  // Default to muted gold
  },
  
  // Metadata & Statistics
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // SmartPick AI Data
  aiEnriched: {
    type: Boolean,
    default: false
  },
  aiLastEnriched: Date,
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // System Fields
  source: {
    type: String,
    enum: ['kaggle', 'manual', 'api', 'ai-generated'],
    default: 'kaggle'
  },
  importId: String,  // Track which import batch
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
bookSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Extract year from publishedDate
bookSchema.pre('save', function(next) {
  if (this.publishedDate && !this.publishedYear) {
    this.publishedYear = this.publishedDate.getFullYear();
  }
  next();
});

// Virtual for formatted author list
bookSchema.virtual('authorList').get(function() {
  if (this.authors.length <= 2) {
    return this.authors.join(' and ');
  }
  return `${this.authors.slice(0, -1).join(', ')}, and ${this.authors[this.authors.length - 1]}`;
});

// Virtual for reading time estimate
bookSchema.virtual('readingTime').get(function() {
  if (!this.pages) return 'Unknown';
  const avgReadingSpeed = 250; // words per minute
  const wordsPerPage = 300; // average
  const totalWords = this.pages * wordsPerPage;
  const hours = Math.round(totalWords / (avgReadingSpeed * 60) * 10) / 10;
  
  if (hours < 1) return 'Less than an hour';
  if (hours === 1) return 'About 1 hour';
  if (hours < 5) return `About ${hours} hours`;
  return `${Math.round(hours)} hours`;
});

// Indexes for common queries
bookSchema.index({ title: 'text', description: 'text' }); // Text search
bookSchema.index({ categories: 1 });
bookSchema.index({ 'ratings.average': -1 });
bookSchema.index({ publishedYear: -1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;