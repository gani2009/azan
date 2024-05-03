/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FEA81B'
      },
      fontFamily: {
        pbold: ["Poppins-Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};