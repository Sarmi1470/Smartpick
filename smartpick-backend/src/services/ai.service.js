const axios = require('axios');
const environment = require('../config/environment');
const AppError = require('../utils/AppError');

/**
 * AI Service - Interface for your friend's AI system
 * 
 * This is the CONTRACT between frontend and AI developer.
 * Your friend needs to implement these endpoints.
 */
class AIService {
  constructor() {
    this.baseURL = environment.AI_SERVICE.endpoint;
    this.apiKey = environment.AI_SERVICE.apiKey;
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Generate comparison questions based on scanned books
   * 
   * Input: Array of book objects with details
   * Output: Questions that help differentiate between them
   */
  async generateComparisonQuestions(books) {
    try {
      // TODO: Your friend implements this endpoint
      const response = await axios.post(`${this.baseURL}/api/generate/comparison`, {
        books: books.map(book => ({
          id: book._id,
          title: book.title,
          authors: book.authors,
          categories: book.categories,
          description: book.description,
          pages: book.pages
        }))
      }, {
        headers: { 'X-API-Key': this.apiKey },
        timeout: this.timeout
      });

      return response.data.questions;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Fallback questions if AI is unavailable
      return this.getFallbackQuestions(books);
    }
  }

  /**
   * Analyze comparison answers and recommend a book
   * 
   * Input: Books being compared + user answers
   * Output: Which book is best and why
   */
  async analyzeComparison({ books, answers }) {
    try {
      const response = await axios.post(`${this.baseURL}/api/analyze/comparison`, {
        books: books.map(book => ({
          id: book._id,
          title: book.title,
          authors: book.authors,
          categories: book.categories,
          description: book.description,
          readingDifficulty: book.readingDifficulty,
          moodVibes: book.moodVibes
        })),
        answers: answers.map((q, index) => ({
          question: q.question,
          answer: q.userAnswer,
          options: q.options
        }))
      }, {
        headers: { 'X-API-Key': this.apiKey },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Fallback: return first book with generic explanation
      return {
        recommendation: {
          bookId: books[0]._id,
          confidence: 0.6
        },
        explanation: "Based on your answers, this classic choice stands out. But I'd love to give you a more thoughtful recommendation when my AI brain is fully awake!",
        alternatives: books.slice(1).map(book => ({
          bookId: book._id,
          reason: "Also a wonderful choice, depending on your mood."
        }))
      };
    }
  }

  /**
   * Generate personality questions for "Surprise Me" feature
   */
  async generatePersonalityQuestions() {
    try {
      const response = await axios.get(`${this.baseURL}/api/questions/personality`, {
        headers: { 'X-API-Key': this.apiKey },
        timeout: this.timeout
      });

      return response.data.questions;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Fallback questions
      return [
        {
          text: "How do you want to feel after reading?",
          options: ["Inspired", "Thoughtful", "Entertained", "Enlightened"]
        },
        {
          text: "How much time do you have?",
          options: ["A cozy evening", "A weekend", "A whole week", "No rush at all"]
        },
        {
          text: "Light read or mind-bender?",
          options: ["Light and breezy", "Balanced", "Make me think", "Break my brain"]
        }
      ];
    }
  }

  /**
   * Fallback questions for when AI is unavailable
   */
  getFallbackQuestions(books) {
    const bookTitles = books.map(b => b.title).join(' and ');
    
    return [
      {
        text: `Between ${bookTitles}, which one calls to you visually?`,
        options: ["The cover art", "The spine design", "The typography", "Not judging by covers!"]
      },
      {
        text: "What's your current reading mood?",
        options: ["Deep and immersive", "Light and quick", "Emotionally intense", "Intellectually challenging"]
      },
      {
        text: "How much time do you have?",
        options: ["A few hours", "A couple of days", "A whole week", "No deadline"]
      }
    ];
  }

  /**
   * Generate personality profile based on answers
   */
  async generatePersonalityProfile(answers) {
    try {
      const response = await axios.post(`${this.baseURL}/api/analyze/personality`, {
        answers
      }, {
        headers: { 'X-API-Key': this.apiKey },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      // Fallback profile
      return {
        type: "Contemplative Reader",
        description: "You read not just for stories, but for the spaces between words.",
        traits: ["Thoughtful", "Patient", "Deep"]
      };
    }
  }
}

module.exports = new AIService();