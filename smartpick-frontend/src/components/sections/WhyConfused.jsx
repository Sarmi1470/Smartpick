import { motion } from 'framer-motion'
import { Brain, AlertCircle, Loader, TrendingUp, BookOpen } from 'lucide-react'

export default function WhyConfused() {
  const factors = [
    {
      icon: <Brain className="w-8 h-8 text-muted-gold" />,
      title: 'Decision Fatigue',
      description: 'Your brain gets tired after making too many choices. After a long day, picking a book feels impossible.'
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-soft-lavender" />,
      title: 'Choice Overload',
      description: 'Too many options actually paralyze us. When everything looks good, nothing feels right.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-muted-gold" />,
      title: 'Analysis Paralysis',
      description: 'Overthinking reviews, ratings, and recommendations until you forget what you actually wanted.'
    },
    {
      icon: <Loader className="w-8 h-8 text-soft-lavender" />,
      title: 'Cognitive Bias',
      description: 'We compare books to an imagined "perfect read" that probably doesn\'t exist.'
    }
  ]

  return (
    <div className="content-card">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl mb-4">🧠 Why Am I So Confused?</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          It's not you. It's your brain. Here's why choosing a book 
          feels harder than it should be.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {factors.map((factor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="mb-4">{factor.icon}</div>
            <h3 className="text-xl font-playfair mb-2">{factor.title}</h3>
            <p className="text-text-secondary">{factor.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center p-8 bg-gradient-to-r from-muted-gold/10 to-soft-lavender/10 
                   rounded-xl border border-white/10"
      >
        <BookOpen className="w-12 h-12 text-muted-gold mx-auto mb-4" />
        <h3 className="text-2xl font-playfair mb-3">That's where I come in</h3>
        <p className="text-text-secondary max-w-2xl mx-auto">
          SmartPick acts as your decision support system - taking the cognitive load off 
          so you can focus on what matters: actually enjoying a good book.
        </p>
      </motion.div>
    </div>
  )
}