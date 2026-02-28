import { useState } from 'react'
import { Scan, Scale, Sparkles, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero({ scannedBooks, setScannedBooks }) {
  const [isHovering, setIsHovering] = useState(null)

  const handleScanClick = () => {
    document.getElementById('single').scrollIntoView({ behavior: 'smooth' })
  }

  const handleCompareClick = () => {
    document.getElementById('compare').scrollIntoView({ behavior: 'smooth' })
  }

  const handleSurpriseClick = () => {
    document.getElementById('surprise').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="content-card text-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-muted-gold/20 rounded-tl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-soft-lavender/20 rounded-br-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-playfair mb-6">
          👋 Hey there. I'm{' '}
          <span className="accent-gradient-text">SmartPick</span>
          <br />
          <span className="text-3xl md:text-4xl text-text-secondary">
            your book-decision wingman.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto">
          Staring at multiple books and overthinking every single one? 
          Yeah… we've all been there. Let me help you choose the one!
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovering('scan')}
            onHoverEnd={() => setIsHovering(null)}
            onClick={handleScanClick}
            className="btn-primary flex items-center gap-3 text-lg group relative overflow-hidden"
          >
            <Scan className={`w-5 h-5 transition-transform ${isHovering === 'scan' ? 'rotate-12' : ''}`} />
            <span>🔍 Let's Scan a Book</span>
            <motion.div
              className="absolute inset-0 bg-muted-gold/10"
              initial={{ x: '-100%' }}
              animate={{ x: isHovering === 'scan' ? '0%' : '-100%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovering('compare')}
            onHoverEnd={() => setIsHovering(null)}
            onClick={handleCompareClick}
            className="btn-secondary flex items-center gap-3 text-lg group"
          >
            <Scale className="w-5 h-5" />
            <span>⚖️ Help Me Compare</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovering('surprise')}
            onHoverEnd={() => setIsHovering(null)}
            onClick={handleSurpriseClick}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl 
                     text-text-primary hover:bg-white/10 transition-all 
                     duration-300 font-medium flex items-center gap-3 text-lg"
          >
            <Sparkles className="w-5 h-5 text-soft-lavender" />
            <span>🎲 Surprise Me</span>
          </motion.button>
        </div>

        {/* Floating book animations */}
        <div className="relative h-20 mt-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 w-12 h-16 bg-white/5 border border-white/10 rounded-lg"
              style={{ 
                left: `${40 + i * 15}%`,
                rotate: `${-10 + i * 5}deg`,
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              <div className="w-full h-2 bg-muted-gold/30 mt-2"></div>
              <div className="w-3/4 h-2 bg-muted-gold/20 mx-auto mt-1"></div>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ArrowDown className="w-6 h-6 text-text-secondary" />
        </motion.div>
      </motion.div>
    </div>
  )
}