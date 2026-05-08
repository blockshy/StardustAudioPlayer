/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        serif: ['"Cormorant Garamond"', 'Georgia', 'ui-serif', 'serif'],
        display: ['Cinzel', 'Georgia', 'ui-serif', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        vinyl: '0 0 20px rgba(0,0,0,0.8)',
        glow: '0 0 40px var(--theme-color)',
      },
    },
  },
  safelist: [
    'hover:bg-white/10',
    'hover:bg-black/10',
    'hover:bg-white/5',
    'hover:bg-black/5',
    'hover:text-white',
    'hover:text-white/80',
    'hover:text-black',
    'hover:text-black/80',
    'hover:text-gray-900',
    'group-hover:text-white',
    'group-hover:text-white/80',
    'group-hover:text-gray-900',
    'group-hover:text-gray-700',
    'hover:border-white/40',
    'hover:border-black/40',
    'hover:border-gray-500',
    'border-white/40',
    'border-black/40',
    'bg-white/20',
    'bg-white/10',
    'bg-white/5',
    'bg-black/10',
    'bg-black/5',
  ],
  plugins: [],
};
