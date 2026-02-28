import { useState, useEffect } from 'react'
import { Menu, X, BookOpen, Scan, Sparkles } from 'lucide-react'

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'single', label: 'Single Scan' },
  { id: 'compare', label: 'Compare' },
  { id: 'surprise', label: 'Surprise Me' },
  { id: 'why-confused', label: 'Why?' },
  { id: 'personality', label: 'Your Profile' },
  { id: 'about', label: 'About' },
]

export default function Navigation({ currentSection }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-deep-charcoal/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-muted-gold" />
            <span className="font-playfair text-xl font-semibold">
              Smart<span className="text-muted-gold">Pick</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${
                  currentSection === item.id ? 'text-muted-gold after:w-full' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-text-primary hover:text-muted-gold transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-white/10">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 text-text-secondary hover:text-muted-gold hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}