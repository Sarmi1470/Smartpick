import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles, BookMarked, Clock, Coffee, Moon, Sun, Cloud } from 'lucide-react'

export default function ReadingPersonality() {
  const [selectedProfile, setSelectedProfile] = useState(null)

  const profiles = [
    {
      type: 'The Thoughtful Explorer',
      icon: <Moon className="w-6 h-6" />,
      description: 'You read slowly, deliberately. Each book is a journey, not a destination.',
      traits: ['Patient', 'Reflective', 'Deep'],
      perfectFor: ['Literary fiction', 'Philosophy', 'Historical biographies'],
      readingHabits: '2-3 books per month, often re-reading passages'
    },
    {
      type: 'The Page Turner',
      icon: <Coffee className="w-6 h-6" />,
      description: 'You devour books. Once you start, you can\'t stop until the last page.',
      traits: ['Energetic', 'Curious', 'Immersive'],
      perfectFor: ['Thrillers', 'Mysteries', 'Fast-paced fantasy'],
      readingHabits: '4-6 books per month, often in one sitting'
    },
    {
      type: 'The Mood Reader',
      icon: <Cloud className="w-6 h-6" />,
      description: 'Your reading list changes with the weather. Every book finds you at the right time.',
      traits: ['Intuitive', 'Flexible', 'Emotional'],
      perfectFor: ['Contemporary fiction', 'Memoirs', 'Poetry'],
      readingHabits: 'Varies wildly - 5 books one month, 1 the next'
    },
    {
      type: 'The Completionist',
      icon: <BookMarked className="w-6 h-6" />,
      description: 'You have a list. A very long list. And you\'re working through it, systematically.',
      traits: ['Organized', 'Dedicated', 'Ambitious'],
      perfectFor: ['Series', 'Award winners', 'Classics'],
      readingHabits: 'Tracks everything, always has a queue'
    }
  ]

  return (
    <div className="content-card">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl mb-4">📊 Your Reading Personality</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Based on your choices, here's what makes you unique as a reader.
          Take the quiz to discover your profile!
        </p>
      </div>

      {!selectedProfile ? (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {profiles.map((profile, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedProfile(profile)}
                className="glass-card p-6 text-left hover:border-muted-gold/30 
                         transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-muted-gold">{profile.icon}</span>
                  <h3 className="text-xl font-playfair">{profile.type}</h3>
                </div>
                <p className="text-text-secondary text-sm mb-3">{profile.description}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.traits.map((trait, i) => (
                    <span key={i} className="px-2 py-1 bg-white/5 rounded-full text-xs">
                      {trait}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-text-secondary text-sm">
              Haven't taken the quiz yet? Try the{' '}
              <a href="#surprise" className="text-muted-gold hover:underline">
                Surprise Me
              </a>{' '}
              section to discover your profile!
            </p>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <button
            onClick={() => setSelectedProfile(null)}
            className="text-text-secondary hover:text-muted-gold transition-colors mb-4"
          >
            ← Back to all profiles
          </button>

          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-muted-gold/20 rounded-xl">
                {selectedProfile.icon}
              </div>
              <div>
                <h3 className="text-2xl font-playfair mb-1">{selectedProfile.type}</h3>
                <p className="text-text-secondary">{selectedProfile.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-playfair text-lg mb-3">Your Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.traits.map((trait, i) => (
                    <span key={i} className="px-3 py-1 bg-soft-lavender/10 
                                         border border-soft-lavender/30 rounded-lg 
                                         text-soft-lavender">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-playfair text-lg mb-3">Perfect For</h4>
                <ul className="space-y-2 text-text-secondary">
                  {selectedProfile.perfectFor.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="font-playfair text-lg mb-2">Reading Habits</h4>
              <p className="text-text-secondary">{selectedProfile.readingHabits}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 btn-primary">
                Get Book Recommendations
              </button>
              <button className="flex-1 btn-secondary">
                Retake Quiz
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}