import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, X, ChevronRight, Loader2, Scale, BookOpen } from 'lucide-react'
import ISBNScanner from '../ISBNScanner'
import QuizInterface from '../QuizInterface'
import ResultsDisplay from '../ResultsDisplay'
import { bookService, quizService } from '../../services/api'
import { useBooks } from '../../context/BookContext'

export default function CompareBooks() {
  const [showScanner, setShowScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [results, setResults] = useState(null)
  
  const { scannedBooks, addScannedBook, removeScannedBook, clearScannedBooks } = useBooks()

  const handleScan = async (isbn) => {
    setShowScanner(false)
    setLoading(true)
    setError('')
    
    try {
      const response = await bookService.getByISBN(isbn)
      addScannedBook(response.data)
    } catch (err) {
      setError(err.error || 'Failed to fetch book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartComparison = async () => {
    if (scannedBooks.length < 2) return
    
    setLoading(true)
    try {
      const isbns = scannedBooks.map(book => book.isbn)
      const response = await quizService.startComparison(isbns)
      setCurrentQuiz(response.data)
      setQuizStarted(true)
      setResults(null) // Clear any previous results
    } catch (err) {
      setError(err.error || 'Failed to start comparison')
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = async (answers) => {
    setLoading(true)
    try {
      const response = await quizService.submitAnswers(currentQuiz.quizId, answers)
      setResults(response.data)
      setQuizStarted(false)
      setCurrentQuiz(null)
    } catch (err) {
      setError(err.error || 'Failed to submit answers')
    } finally {
      setLoading(false)
    }
  }

  const removeBook = (isbn) => {
    removeScannedBook(isbn)
  }

  const resetComparison = () => {
    clearScannedBooks()
    setQuizStarted(false)
    setCurrentQuiz(null)
    setResults(null)
    setError('')
  }

  return (
    <div className="content-card">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl mb-4">⚖️ Too many good options?</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Scan up to 5 books, and I'll help you figure out which one 
          truly deserves a spot on your nightstand.
        </p>
      </div>

      {/* Quiz Interface */}
      {quizStarted && currentQuiz && (
        <QuizInterface
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
          onCancel={resetComparison}
        />
      )}

      {/* Results Display */}
      {results && !quizStarted && (
        <ResultsDisplay
          results={results}
          onReset={resetComparison}
        />
      )}

      {/* Book Selection Interface - Only show when no quiz or results */}
      {!quizStarted && !results && (
        <>
          {/* Scanned books grid */}
          {scannedBooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-playfair text-xl">
                  Your stack ({scannedBooks.length}/5)
                </h3>
                <button
                  onClick={clearScannedBooks}
                  className="text-sm text-text-secondary hover:text-muted-gold transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scannedBooks.map((book) => (
                  <motion.div
                    key={book.isbn}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group"
                  >
                    <div className="glass-card p-4 hover:border-muted-gold/30 transition-all">
                      <button
                        onClick={() => removeBook(book.isbn)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 
                                 border border-red-500/30 rounded-full flex items-center 
                                 justify-center opacity-0 group-hover:opacity-100 
                                 transition-opacity"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-16 rounded bg-gradient-to-br from-muted-gold/20 to-soft-lavender/20" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{book.title}</p>
                          <p className="text-sm text-text-secondary truncate">{book.authors}</p>
                          <p className="text-xs text-text-secondary/60 mt-1">
                            {book.publishedYear} · {book.pages}p
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add more button */}
                {scannedBooks.length < 5 && (
                  <button
                    onClick={() => setShowScanner(true)}
                    className="glass-card p-4 border-2 border-dashed border-white/10 
                             hover:border-muted-gold/30 transition-all flex flex-col 
                             items-center justify-center gap-2 min-h-[120px]"
                  >
                    <Scan className="w-6 h-6 text-text-secondary" />
                    <span className="text-sm text-text-secondary">Scan another</span>
                  </button>
                )}
              </div>

              {/* Start comparison button */}
              {scannedBooks.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={handleStartComparison}
                    disabled={loading}
                    className="btn-primary flex items-center gap-3 text-lg px-8 py-4 mx-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Starting quiz...</span>
                      </>
                    ) : (
                      <>
                        <Scale className="w-5 h-5" />
                        <span>Compare These {scannedBooks.length} Books</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Empty state */}
          {scannedBooks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
              <p className="text-text-secondary mb-6">
                No books yet. Start scanning to compare!
              </p>
              <button
                onClick={() => setShowScanner(true)}
                className="btn-primary flex items-center gap-3 text-lg px-8 py-4 mx-auto"
              >
                <Scan className="w-5 h-5" />
                <span>Scan First Book</span>
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner modal */}
      <AnimatePresence>
        {showScanner && (
          <ISBNScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
            mode="compare"
          />
        )}
      </AnimatePresence>
    </div>
  )
}