import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Clock, Brain, Loader2, ChevronRight, BookOpen } from 'lucide-react'
import { quizService } from '../../services/api'

export default function SurpriseMe() {
  const [step, setStep] = useState('questions') // questions, loading, results
  const [answers, setAnswers] = useState({})
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)

  const questions = [
    {
      id: 'feeling',
      text: 'How do you want to feel after reading?',
      icon: <Sparkles className="w-5 h-5 text-muted-gold" />,
      options: [
        { value: 'inspired', label: '✨ Inspired', description: 'Ready to change the world' },
        { value: 'thoughtful', label: '💭 Thoughtful', description: 'Deep in contemplation' },
        { value: 'entertained', label: '🎭 Entertained', description: 'Escaped reality for a bit' },
        { value: 'enlightened', label: '🌟 Enlightened', description: 'Saw things differently' }
      ]
    },
    {
      id: 'time',
      text: 'How much time do you have?',
      icon: <Clock className="w-5 h-5 text-muted-gold" />,
      options: [
        { value: 'evening', label: '🌙 A cozy evening', description: '2-3 hours' },
        { value: 'weekend', label: '📅 A weekend', description: '4-8 hours' },
        { value: 'week', label: '📆 A whole week', description: '8-15 hours' },
        { value: 'norush', label: '⏳ No rush at all', description: 'Take your time' }
      ]
    },
    {
      id: 'depth',
      text: 'Light read or mind-bender?',
      icon: <Brain className="w-5 h-5 text-muted-gold" />,
      options: [
        { value: 'light', label: '☕ Light and breezy', description: 'Easy, relaxing read' },
        { value: 'balanced', label: '⚖️ Balanced', description: 'A bit of both' },
        { value: 'deep', label: '🤔 Make me think', description: 'Engaging and thoughtful' },
        { value: 'complex', label: '🌀 Break my brain', description: 'Complex and challenging' }
      ]
    }
  ]

  const currentQuestion = questions[Object.keys(answers).length]

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (Object.keys(newAnswers).length === questions.length) {
      // All questions answered - get recommendations
      getRecommendations(newAnswers)
    }
  }

  const getRecommendations = async (userAnswers) => {
    setLoading(true)
    setStep('loading')
    
    try {
      // Start surprise quiz
      const response = await quizService.startSurprise()
      // In a real implementation, you'd submit answers and get recommendations
      // For now, simulate a delay
      setTimeout(() => {
        setRecommendations({
          books: [
            {
              title: 'The Midnight Library',
              author: 'Matt Haig',
              match: 95,
              reason: 'Perfect for your thoughtful evening mood',
              vibe: '💭 Thoughtful'
            },
            {
              title: 'Project Hail Mary',
              author: 'Andy Weir',
              match: 88,
              reason: 'Engaging and balanced for your available time',
              vibe: '🤔 Make me think'
            },
            {
              title: 'The House in the Cerulean Sea',
              author: 'T.J. Klune',
              match: 82,
              reason: 'Light, cozy, and heartwarming',
              vibe: '✨ Inspired'
            }
          ]
        })
        setStep('results')
        setLoading(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to get recommendations:', err)
      setStep('questions')
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setStep('questions')
    setAnswers({})
    setRecommendations(null)
  }

  return (
    <div className="content-card">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl mb-4">🎲 Surprise Me</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Don't know what you want? Answer a few questions and let me 
          surprise you with something you'll love.
        </p>
      </div>

      {step === 'questions' && currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            {currentQuestion.icon}
            <h3 className="text-xl font-playfair">{currentQuestion.text}</h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className="w-full glass-card p-4 text-left hover:border-muted-gold/30 
                         transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium mb-1">{option.label}</p>
                    <p className="text-sm text-text-secondary">{option.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-muted-gold 
                                        group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center text-sm text-text-secondary">
            <span>Question {Object.keys(answers).length + 1} of {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < Object.keys(answers).length 
                      ? 'bg-muted-gold' 
                      : i === Object.keys(answers).length
                      ? 'bg-muted-gold/50'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {step === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Loader2 className="w-12 h-12 animate-spin text-muted-gold mx-auto mb-4" />
          <p className="text-text-secondary">Finding your perfect surprise...</p>
          <p className="text-sm text-text-secondary/60 mt-2">This might take a moment</p>
        </motion.div>
      )}

      {step === 'results' && recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-muted-gold mx-auto mb-3" />
            <h3 className="text-2xl font-playfair mb-2">Your Surprise Picks</h3>
            <p className="text-text-secondary">Based on your answers, I think you'll love:</p>
          </div>

          {recommendations.books.map((book, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-playfair mb-1">{book.title}</h4>
                  <p className="text-text-secondary">by {book.author}</p>
                </div>
                <div className="px-3 py-1 bg-muted-gold/20 rounded-full text-muted-gold text-sm">
                  {book.match}% match
                </div>
              </div>
              <p className="text-text-secondary mb-3">{book.reason}</p>
              <p className="text-sm text-soft-lavender">{book.vibe}</p>
            </motion.div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              onClick={resetQuiz}
              className="flex-1 btn-secondary"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '#single'}
              className="flex-1 btn-primary"
            >
              Scan a Book
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}