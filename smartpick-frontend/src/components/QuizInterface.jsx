import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, ChevronLeft, Loader2, Sparkles, 
  Award, BookOpen, TrendingUp, X, CheckCircle 
} from 'lucide-react'
import { quizService } from '../services/api'

export default function QuizInterface({ quiz, onComplete, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const currentQuestion = quiz?.questions?.[currentIndex]
  const progress = ((currentIndex + 1) / quiz?.totalQuestions) * 100

  const handleAnswer = async (answer) => {
    const newAnswers = [...answers, { questionId: currentIndex, answer }]
    setAnswers(newAnswers)

    if (currentIndex + 1 < quiz.totalQuestions) {
      // Move to next question
      setCurrentIndex(currentIndex + 1)
    } else {
      // Quiz complete - submit all answers
      await submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers) => {
    setLoading(true)
    setError('')
    
    try {
      // Submit each answer sequentially
      for (let i = 0; i < finalAnswers.length; i++) {
        await quizService.submitAnswer(
          quiz.sessionId,
          finalAnswers[i].questionId,
          finalAnswers[i].answer
        )
      }
      
      // Get results
      const response = await quizService.getResults(quiz.sessionId)
      setResults(response.data)
      onComplete(response.data)
    } catch (err) {
      setError(err.error || 'Failed to process your answers')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Loader2 className="w-12 h-12 animate-spin text-muted-gold mx-auto mb-4" />
        <p className="text-text-secondary">Analyzing your answers...</p>
        <p className="text-sm text-text-secondary/60 mt-2">This might take a moment</p>
      </motion.div>
    )
  }

  if (results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Success Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-muted-gold/20 rounded-full flex items-center 
                     justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-muted-gold" />
          </motion.div>
          <h3 className="text-2xl font-playfair mb-2">🎉 I've Got It!</h3>
          <p className="text-text-secondary">
            Based on your answers, here's your perfect match:
          </p>
        </div>

        {/* Main Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 border-2 border-muted-gold/30 relative overflow-hidden"
        >
          {/* Confidence Badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 bg-muted-gold/20 rounded-full text-sm text-muted-gold">
              {results.recommendation?.confidence || '95%'} match
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Book Cover Placeholder */}
            <div className="w-32 h-48 rounded-lg bg-gradient-to-br from-muted-gold/30 
                          to-soft-lavender/30 border border-white/10 flex items-center 
                          justify-center flex-shrink-0">
              <BookOpen className="w-12 h-12 text-text-secondary/50" />
            </div>

            <div className="flex-1">
              <h4 className="text-2xl font-playfair mb-2">
                {results.recommendation?.book?.title || 'The Perfect Book'}
              </h4>
              <p className="text-text-secondary mb-4">
                by {results.recommendation?.book?.authors || 'Your Next Favorite Author'}
              </p>

              {/* Explanation */}
              <div className="p-4 bg-white/5 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-muted-gold" />
                  <span className="font-medium">Why this one?</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {results.recommendation?.explanation || 
                   "This book aligns perfectly with your preferences. Its pacing matches your available time, its depth suits your current mood, and its themes resonate with what you're looking for."}
                </p>
              </div>

              {/* Key Matches */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-soft-lavender/10 border border-soft-lavender/30 
                               rounded-full text-xs text-soft-lavender">
                  🎯 Perfect pacing
                </span>
                <span className="px-3 py-1 bg-soft-lavender/10 border border-soft-lavender/30 
                               rounded-full text-xs text-soft-lavender">
                  💭 Matches your mood
                </span>
                <span className="px-3 py-1 bg-soft-lavender/10 border border-soft-lavender/30 
                               rounded-full text-xs text-soft-lavender">
                  ⭐ Highly rated
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alternative Recommendations */}
        {results.alternatives && results.alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xl font-playfair mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-gold" />
              Also Consider
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {results.alternatives.map((alt, index) => (
                <div key={index} className="glass-card p-4 hover:border-muted-gold/30 transition-all">
                  <div className="flex gap-3">
                    <div className="w-12 h-16 rounded bg-gradient-to-br from-muted-gold/20 
                                  to-soft-lavender/20 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium mb-1">{alt.book?.title || 'Another Great Read'}</h5>
                      <p className="text-xs text-text-secondary mb-2">{alt.reason}</p>
                      <span className="text-xs text-soft-lavender">{alt.book?.authors}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Start Over
          </button>
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(results.recommendation?.book?.title + ' book')}`, '_blank')}
            className="flex-1 btn-primary"
          >
            Find This Book
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Question {currentIndex + 1} of {quiz.totalQuestions}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-muted-gold to-soft-lavender"
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl md:text-2xl font-playfair mb-6">
            {currentQuestion?.text}
          </h3>

          <div className="space-y-3">
            {currentQuestion?.options?.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(option)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl
                         hover:border-muted-gold/30 hover:bg-white/10 
                         transition-all text-left group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-text-primary">{option}</span>
                  <ChevronRight className="w-5 h-5 text-text-secondary 
                                        group-hover:text-muted-gold 
                                        group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg
                        transition-all ${
                          currentIndex === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'text-text-secondary hover:text-muted-gold'
                        }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={onCancel}
              className="text-text-secondary hover:text-muted-gold transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 
                     rounded-lg text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}