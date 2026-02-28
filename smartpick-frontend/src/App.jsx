import { useState, useEffect } from 'react'
import Hero from './components/sections/Hero'
import SingleBook from './components/sections/SingleBook'
import CompareBooks from './components/sections/CompareBooks'
import SurpriseMe from './components/sections/SurpriseMe'
import WhyConfused from './components/sections/WhyConfused'
import ReadingPersonality from './components/sections/ReadingPersonality'
import About from './components/sections/About'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { BookProvider } from './context/BookContext'

function App() {
  const [scannedBooks, setScannedBooks] = useState([])
  const [currentSection, setCurrentSection] = useState('hero')

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section')
      const scrollPosition = window.scrollY + window.innerHeight / 3

      sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionBottom = sectionTop + section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
          setCurrentSection(section.id)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <BookProvider>
      <div className="relative">
        {/* Floating background elements for Dark Academia aesthetic */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-muted-gold/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-soft-lavender/5 rounded-full blur-3xl"></div>
        </div>

        <Navigation currentSection={currentSection} />
        
        <main>
          <section id="hero" className="section-container">
            <Hero scannedBooks={scannedBooks} setScannedBooks={setScannedBooks} />
          </section>

          <section id="single" className="section-container">
            <SingleBook />
          </section>

          <section id="compare" className="section-container">
            <CompareBooks scannedBooks={scannedBooks} setScannedBooks={setScannedBooks} />
          </section>

          <section id="surprise" className="section-container">
            <SurpriseMe />
          </section>

          <section id="why-confused" className="section-container">
            <WhyConfused />
          </section>

          <section id="personality" className="section-container">
            <ReadingPersonality />
          </section>

          <section id="about" className="section-container">
            <About />
          </section>
        </main>

        <Footer />
      </div>
    </BookProvider>
  )
}

export default App