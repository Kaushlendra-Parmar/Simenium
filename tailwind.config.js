/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js}",
    "!./node_modules/**/*"
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif']
      },
      colors: {
        'deep-blue-gray': '#1E293B',
        'sky-blue': '#38BDF8',
        'royal-blue': '#3B82F6',
        'royal-blue-dark': '#2563EB',
        'cloud-white': '#F8FAFC'
      }
    },
  },
  plugins: [],
}
