/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f8f8fb',
          100: '#f0f0f6',
          200: '#e0e0ed',
          300: '#c8c8d9',
          400: '#a8a8bf',
          500: '#8888a0',
          600: '#6b6b7f',
          700: '#484896',
          800: '#242448',
          900: '#121224',
        },
      },
    },
  },
  plugins: [],
}
