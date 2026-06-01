import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './index.tsx', './App.tsx'],
  theme: {
    extend: {
      colors: {
        navy: '#001F3F',
        luxuryGold: '#C5A059',
        softGray: '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};
