/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        void: '#0F0A1F',
        surface: '#1A1226',
        primary: '#9333EA',
        secondary: '#A78BFA',
        accent: '#FBBF24',
        text: '#E9D5FF',
      },
    },
  },
  plugins: [],
}
