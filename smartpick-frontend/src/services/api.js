import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Book endpoints
export const bookService = {
  // Get book by ISBN
  getByISBN: async (isbn) => {
    try {
      const response = await api.get(`/books/isbn/${isbn}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch book' }
    }
  },

  // Compare multiple books
  compareBooks: async (isbns) => {
    try {
      const response = await api.post('/books/compare', { isbns })
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to compare books' }
    }
  },

  // Search books
  searchBooks: async (query, page = 1) => {
    try {
      const response = await api.get('/books/search', { params: { q: query, page } })
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to search books' }
    }
  },

  // Get random books
  getRandomBooks: async (count = 3) => {
    try {
      const response = await api.get('/books/random', { params: { count } })
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get random books' }
    }
  },

  // Get books by mood
  getByMood: async (vibe) => {
    try {
      const response = await api.get(`/books/mood/${vibe}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get books by mood' }
    }
  },
}

// Quiz endpoints
export const quizService = {
  // Start comparison quiz
  startComparison: async (isbns) => {
    try {
      const response = await api.post('/quiz/compare/start', { isbns })
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to start quiz' }
    }
  },

  // Submit answer
  submitAnswer: async (sessionId, questionId, answer) => {
    try {
      const response = await api.post(`/quiz/${sessionId}/answer`, { questionId, answer })
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to submit answer' }
    }
  },

  // Start surprise quiz
  startSurprise: async () => {
    try {
      const response = await api.post('/quiz/surprise/start')
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to start surprise quiz' }
    }
  },

  // Get results
  getResults: async (sessionId) => {
    try {
      const response = await api.get(`/quiz/${sessionId}/results`)
      return response.data
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get results' }
    }
  },
}

export default api