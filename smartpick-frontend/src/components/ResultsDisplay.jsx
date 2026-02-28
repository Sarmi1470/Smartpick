import { motion } from 'framer-motion'
import { 
  Award, TrendingUp, BookOpen, Star, Clock, 
  Users, Sparkles, Share2, Bookmark, ExternalLink 
} from 'lucide-react'

export default function ResultsDisplay({ results, onReset }) {
  const { recommendation, alternatives, personalityProfile } = results

  return (
    <div className="space-y-8">
      {/* Personality Profile Banner */}
      {personalityProfile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-l-4 border-l-muted-gold"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted-gold/20 rounded-xl">
              <Award className="w-6 h-6 text-muted-gold" />
            </div>
            <div>
              <h3 className="text-xl font-playfair mb-1">
                {personalityProfile.type || 'Thoughtful Reader'}
              </h3>
              <p className="text-text-secondary text-sm mb-2">
                {personalityProfile.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {personalityProfile.traits?.map((trait, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 rounded-full text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {/* Winner Badge */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="px-4 py-2 bg-gradient-to-r from-muted-gold to-soft-lavender 
                        rounded-full text-deep-charcoal font-semibold flex items-center gap-2
                        shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>🏆 Top Pick</span>
          </div>
        </div>

        <div className="glass-card p-8 pt-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Book Cover with Confidence Ring */}
            <div className="relative">
              <div className="w-40 h-56 rounded-lg bg-gradient-to-br from-muted-gold/30 
                            to-soft-lavender/30 border-2 border-muted-gold/50 
                            flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-text-secondary/50" />
              </div>
              {/* Confidence Score Ring (simplified) */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-deep-charcoal 
                            rounded-full border-2 border-muted-gold flex items-center 
                            justify-center text-sm font-bold text-muted-gold">
                {Math.round((recommendation?.confidence || 0.95) * 100)}%
              </div>
            </div>

            {/* Book Details */}
            <div className="flex-1">
              <h2 className="text-3xl font-playfair mb-2">
                {recommendation?.book?.title}
              </h2>
              <p className="text-text-secondary text-lg mb-4">
                by {recommendation?.book?.authors}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-1 text-soft-lavender mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <p className="font-medium">{recommendation?.book?.ratings?.average || '4.5'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-gold mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Reading</span>
                  </div>
                  <p className="font-medium">{recommendation?.book?.readingTime || '4-6 hrs'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-soft-lavender mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">For</span>
                  </div>
                  <p className="font-medium capitalize">{recommendation?.book?.readingDifficulty || 'Everyone'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-gold mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Pages</span>
                  </div>
                  <p className="font-medium">{recommendation?.book?.pages || '320'}</p>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-text-secondary leading-relaxed">
                  {recommendation?.explanation || 
                   "This book stood out because it perfectly matches your preferences for depth and pacing. Its themes resonate with what you're looking for, and the writing style aligns with your reading comfort zone."}
                </p>
              </div>

              {/* Mood Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {recommendation?.book?.moodVibes?.map((vibe, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                    {vibe}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alternatives Section */}
      {alternatives && alternatives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-playfair mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-gold" />
            Also Great Choices
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {alternatives.map((alt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass-card p-4 hover:border-muted-gold/30 transition-all group cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-20 rounded bg-gradient-to-br from-muted-gold/20 
                                to-soft-lavender/20 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-playfair text-lg mb-1 group-hover:text-muted-gold 
                                 transition-colors">
                      {alt.book?.title || 'Another Great Read'}
                    </h4>
                    <p className="text-sm text-text-secondary mb-2">
                      by {alt.book?.authors || 'Talented Author'}
                    </p>
                    <p className="text-xs text-soft-lavender">
                      {alt.reason || 'Also matches your preferences well'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 pt-4"
      >
        <button
          onClick={onReset}
          className="flex-1 btn-secondary py-3"
        >
          Start New Comparison
        </button>
        <button
          className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Find Online
        </button>
        <button
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                   hover:bg-white/10 transition-colors text-text-secondary
                   hover:text-muted-gold"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                   hover:bg-white/10 transition-colors text-text-secondary
                   hover:text-muted-gold"
        >
          <Bookmark className="w-5 h-5" />
        </button>
      </motion.div>

      {/* AI Confidence Note */}
      <p className="text-xs text-text-secondary/60 text-center">
        🤖 Recommendation generated with {Math.round((recommendation?.confidence || 0.95) * 100)}% confidence 
        based on your responses
      </p>
    </div>
  )
}