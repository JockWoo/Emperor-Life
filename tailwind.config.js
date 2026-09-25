/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif TC"', '"Songti TC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans TC"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
