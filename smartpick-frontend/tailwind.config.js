/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Academia Palette
        'deep-charcoal': '#0F172A',
        'midnight-blue': '#111827',
        'aged-paper': '#F5E6D3',
        'muted-gold': '#F59E0B',
        'soft-lavender': '#A78BFA',
        'dusty-rose': '#B76E79',
        'warm-gray': '#E5E7EB',
        'ink-black': '#1A1A1A',
        
        // Semantic aliases
        primary: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          dark: '#0A0F1A',
        },
        accent: {
          gold: '#F59E0B',
          lavender: '#A78BFA',
          rose: '#B76E79',
        },
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
          accent: '#F59E0B',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'accent-gradient': 'linear-gradient(135deg, #F59E0B 0%, #A78BFA 100%)',
      },
    },
  },
  plugins: [],
}