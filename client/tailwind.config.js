/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff9f5',
          100: '#ffeebd',
          200: '#ffd7b5',
          300: '#ffb885',
          400: '#ff9452',
          500: '#e65a0f', // brand saffron marigold
          600: '#cc4500',
          700: '#a63400',
          800: '#802500',
          900: '#611c00',
          950: '#360c00',
        },
        darkBg: {
          light: '#292524',
          DEFAULT: '#1c1917',
          dark: '#0c0a09',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
