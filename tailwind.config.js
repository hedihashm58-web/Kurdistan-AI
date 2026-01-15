/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-gold': '#FFD700',
        'deep-gold': '#B8860B',
        'soft-gold': '#FFEC8B',
        'obsidian': '#020305',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
      backdropBlur: {
        '25': '25px',
        '60': '60px',
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
