/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pawpink: '#ffc8dd',
        pawpeach: '#ffe5ec',
        pawmint: '#d8f3dc',
        pawsky: '#cdeafe',
      }
    },
  },
  plugins: [],
};
