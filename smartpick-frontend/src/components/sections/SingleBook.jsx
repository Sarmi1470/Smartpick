import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, BookOpen, Loader2, ChevronRight, Sparkles } from 'lucide-react'
import ISBNScanner from '../ISBNScanner'
import { bookService } from '../../services/api'
import { useBooks } from '../../context/BookContext'

export default function SingleBook() {
  const [showScanner, setShowScanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [error, setError] = useState('')
  const { addScannedBook } = useBooks()

  const handleScan = async (isbn) => {
    setShowScanner(false)
    setLoading(true)
    setError('')
    
    try {
      const response = await bookService.getByISBN(isbn)
      setBook(response.data)
      addScannedBook(response.data)
    } catch (err) {
      setError(err.error || 'Failed to fetch book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetScan = () => {
    setBook(null)
    setError('')
  }

  return (
    <div className="content-card">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl mb-4">📖 Curious about this one?</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Scan any book and I'll tell you what it's really about, 
          who it's for, and whether it matches your vibe.
        </p>
      </div>

      {!book && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setShowScanner(true)}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
          >
            <Scan className="w-5 h-5" />
            <span>Scan a Book</span>
          </button>
        </motion.div>
      )}

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="w-12 h-12 animate-spin text-muted-gold mb-4" />
            <p className="text-text-secondary">Fetching your book...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <div className="text-red-400 mb-4">{error}</div>
            <button
              onClick={resetScan}
              className="btn-secondary"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book details */}
      <AnimatePresence>
        {book && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Book header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Cover placeholder or image */}
              <div 
                className="w-32 h-48 rounded-lg bg-gradient-to-br from-muted-gold/20 to-soft-lavender/20 
                         border border-white/10 flex items-center justify-center"
                style={{ backgroundColor: book.coverColor || '#0F172A' }}
              >
                <BookOpen className="w-12 h-12 text-text-secondary/30" />
              </div>

              {/* Book info */}
              <div className="flex-1">
                <h3 className="text-2xl font-playfair mb-2">{book.title}</h3>
                <p className="text-text-secondary mb-2">by {book.authors}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {book.moodVibes?.map((vibe, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                      {vibe}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Pages</span>
                    <p className="font-medium">{book.pages || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Reading time</span>
                    <p className="font-medium">{book.readingTime || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Difficulty</span>
                    <p className="font-medium capitalize">{book.readingDifficulty}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Published</span>
                    <p className="font-medium">{book.publishedYear || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-muted-gold" />
                <h4 className="font-playfair text-lg">What it's really about</h4>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {book.summary || 'Ask SmartPick to analyze this book for personalized insights.'}
              </p>
            </div>

            {/* Perfect for */}
            {book.perfectFor && book.perfectFor.length > 0 && (
              <div>
                <h4 className="font-playfair text-lg mb-3">Perfect for</h4>
                <div className="flex flex-wrap gap-2">
                  {book.perfectFor.map((item, i) => (
                    <span key={i} className="px-4 py-2 bg-soft-lavender/10 border border-soft-lavender/30 
                                         rounded-lg text-soft-lavender">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(book.title + ' book')}`, '_blank')}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <span>Find Online</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={resetScan}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Scan className="w-4 h-4" />
                <span>Scan Another</span>
              </button>
            </div>

            {/* AI status */}
            {!book.aiEnriched && (
              <p className="text-xs text-text-secondary/60 text-center pt-4">
                🤖 This book hasn't been AI-enriched yet. Ask SmartPick for insights!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner modal */}
      <AnimatePresence>
        {showScanner && (
          <ISBNScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
            mode="single"
          />
        )}
      </AnimatePresence>
    </div>
  )
}