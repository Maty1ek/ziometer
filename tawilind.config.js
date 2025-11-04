/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // Adjust paths to match your project structure
    "./public/**/*.html",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {},
      fontFamily: {
        inter: ["var(--font-inter)", "system-ui"], // Fallbacks
      },
    },
  },
};
