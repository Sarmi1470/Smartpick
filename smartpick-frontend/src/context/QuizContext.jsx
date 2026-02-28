import { createContext, useContext, useState } from 'react'

const QuizContext = createContext()

export function QuizProvider({ children }) {
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [quizHistory, setQuizHistory] = useState([])
  const [quizResults, setQuizResults] = useState(null)

  const startQuiz = (quizData) => {
    setActiveQuiz(quizData)
    setQuizResults(null)
  }

  const endQuiz = (results) => {
    setQuizResults(results)
    setQuizHistory(prev => [...prev, {
      ...results,
      timestamp: new Date().toISOString()
    }])
    setActiveQuiz(null)
  }

  const clearQuiz = () => {
    setActiveQuiz(null)
    setQuizResults(null)
  }

  return (
    <QuizContext.Provider value={{
      activeQuiz,
      quizResults,
      quizHistory,
      startQuiz,
      endQuiz,
      clearQuiz
    }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}