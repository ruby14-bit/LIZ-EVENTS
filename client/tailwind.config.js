/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      // This allows the "animate-in" classes to work if you don't have the plugin
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "zoom-in": "zoom-in 0.5s ease-out",
        "slide-in-from-right-4": "slide-in-from-right 0.5s ease-out",
        "slide-in-from-bottom-4": "slide-in-from-bottom 0.7s ease-out",
      }
    },
  },
  plugins: [],
}