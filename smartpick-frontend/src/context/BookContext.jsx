import { createContext, useContext, useState } from 'react'

const BookContext = createContext()

export function BookProvider({ children }) {
  const [scannedBooks, setScannedBooks] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addScannedBook = (book) => {
    setScannedBooks(prev => {
      // Avoid duplicates
      if (prev.some(b => b.isbn === book.isbn)) {
        return prev
      }
      return [...prev, book]
    })
  }

  const removeScannedBook = (isbn) => {
    setScannedBooks(prev => prev.filter(book => book.isbn !== isbn))
  }

  const clearScannedBooks = () => {
    setScannedBooks([])
  }

  return (
    <BookContext.Provider value={{
      scannedBooks,
      addScannedBook,
      removeScannedBook,
      clearScannedBooks,
      currentQuiz,
      setCurrentQuiz,
      userProfile,
      setUserProfile,
      loading,
      setLoading,
      error,
      setError,
    }}>
      {children}
    </BookContext.Provider>
  )
}

export function useBooks() {
  const context = useContext(BookContext)
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider')
  }
  return context
}