import { BookOpen, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-deep-charcoal/50 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-6 h-6 text-muted-gold" />
              <span className="font-playfair text-xl font-semibold">
                Smart<span className="text-muted-gold">Pick</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm">
              Your thoughtful companion in the overwhelming world of books.
              Making decisions, one page at a time.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-playfair text-lg mb-4">Explore</h3>
            <ul className="space-y-2 text-text-secondary">
              <li><a href="#hero" className="hover:text-muted-gold transition-colors">Home</a></li>
              <li><a href="#single" className="hover:text-muted-gold transition-colors">Single Scan</a></li>
              <li><a href="#compare" className="hover:text-muted-gold transition-colors">Compare</a></li>
              <li><a href="#surprise" className="hover:text-muted-gold transition-colors">Surprise Me</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-playfair text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-text-secondary">
              <li><a href="#why-confused" className="hover:text-muted-gold transition-colors">Why Choose?</a></li>
              <li><a href="#personality" className="hover:text-muted-gold transition-colors">Your Profile</a></li>
              <li><a href="#about" className="hover:text-muted-gold transition-colors">About</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-playfair text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-muted-gold transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-muted-gold transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-muted-gold transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-text-secondary text-sm">
          <p>© 2024 SmartPick. An academic project in decision support systems.</p>
          <p className="mt-2 text-xs opacity-60">Crafted with 🖋️ for the indecisive reader</p>
        </div>
      </div>
    </footer>
  )
}