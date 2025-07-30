/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aquariaLight: "#B0C4CF",
        aquariaDark: "#3C4F59",
      },
      fontFamily: {
      sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
    },
    },
  },
  plugins: [],
};
