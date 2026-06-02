/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030712', // gray-950
        surface: '#111827',    // gray-900
        primary: '#4f46e5',    // indigo-600
        secondary: '#0ea5e9',  // sky-500
        accent: '#f43f5e'      // rose-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
