/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#07090E',
          obsidian: '#0B0F17',
          charcoal: '#121824',
          surface: '#182132',
          surfaceLight: '#212D42',
          gold: '#D4AF37',
          goldLight: '#F5DC9A',
          goldDark: '#997B22',
          goldGleam: '#FFF5D6',
          crimson: '#E11D48',
          crimsonDark: '#BE123C',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['"Hind Siliguri"', '"Noto Sans Bengali"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        bangla: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        display: ['Cinzel', '"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'gold-inner': 'inset 0 0 15px rgba(212, 175, 55, 0.15)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'red-glow': '0 0 20px -3px rgba(225, 29, 72, 0.4)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
