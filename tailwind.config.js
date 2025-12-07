/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#13ec5b",
        "primary-dark": "#0fae43",
        "background-light": "#f6f8f6",
        "background-dark": "#102216",
        "surface-dark": "#162e1e",
        "border-dark": "#2a3f31",
        "text-primary-dark": "#f0f4f2",
        "text-secondary-dark": "#a1bfaa",
        "dark-bg": "#121212",
        "dark-surface": "#1E1E1E",
        "success": "#10B981"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
