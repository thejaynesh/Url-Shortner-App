/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        banner: "linear-gradient(to right, #1e3a8a, #3b82f6)",
      },
    },
  },
  plugins: [],
}
