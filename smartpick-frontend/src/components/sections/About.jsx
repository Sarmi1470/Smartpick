import { motion } from 'framer-motion'
import { BookOpen, Github, Twitter, Mail, Heart, Zap, Shield, Sparkles, Brain } from 'lucide-react'

export default function About() {
  return (
    <div className="content-card">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl mb-4">👋 About SmartPick</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          An academic exploration into decision support systems, 
          cognitive psychology, and the art of choosing well.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-playfair mb-4">The Problem</h3>
          <p className="text-text-secondary leading-relaxed">
            In a world with millions of books, endless reviews, and constant recommendations,
            making a simple choice has become overwhelming. We spend more time deciding
            what to read than actually reading.
          </p>
          <p className="text-text-secondary leading-relaxed">
            SmartPick was born from a simple observation: sometimes, we need a thoughtful
            friend to cut through the noise and say, "This one. This is for you."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-playfair mb-4">The Solution</h3>
          <p className="text-text-secondary leading-relaxed">
            Using AI-assisted decision support, SmartPick helps you navigate choice paralysis.
            By scanning ISBNs and understanding your preferences, we don't just recommend books —
            we explain why they're right for you.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Think of it as a decision-making framework, wrapped in a warm, literary interface.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: <Zap className="w-6 h-6 text-muted-gold" />,
            title: 'ISBN Mapping',
            description: 'Public dataset integration for comprehensive book data'
          },
          {
            icon: <Brain className="w-6 h-6 text-soft-lavender" />,
            title: 'AI Decision Support',
            description: 'Dynamic quiz generation and recommendation logic'
          },
          {
            icon: <Shield className="w-6 h-6 text-muted-gold" />,
            title: 'Cognitive Design',
            description: 'Built on principles of decision fatigue and choice overload'
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 text-center"
          >
            <div className="flex justify-center mb-4">{item.icon}</div>
            <h4 className="font-playfair text-lg mb-2">{item.title}</h4>
            <p className="text-text-secondary text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center p-8 bg-white/5 rounded-xl border border-white/10"
      >
        <h3 className="text-2xl font-playfair mb-4 flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 text-muted-gold" />
          Academic Context
        </h3>
        <p className="text-text-secondary max-w-2xl mx-auto mb-4">
          SmartPick is a final-year MCA project demonstrating the application of 
          AI in decision support systems, human-centered design, and cognitive psychology principles.
        </p>
        <p className="text-sm text-text-secondary/60">
          Built with React, Node.js, MongoDB, and lots of ☕
        </p>
      </motion.div>

      <div className="flex justify-center gap-6 mt-8">
        <a href="#" className="text-text-secondary hover:text-muted-gold transition-colors">
          <Github className="w-6 h-6" />
        </a>
        <a href="#" className="text-text-secondary hover:text-muted-gold transition-colors">
          <Twitter className="w-6 h-6" />
        </a>
        <a href="#" className="text-text-secondary hover:text-muted-gold transition-colors">
          <Mail className="w-6 h-6" />
        </a>
      </div>
    </div>
  )
}