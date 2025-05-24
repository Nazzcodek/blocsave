/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f7f4",
          100: "#ccefe9",
          200: "#99dfd3",
          300: "#66cfbd",
          400: "#33bfa7",
          500: "#00af91", // primary brand color
          600: "#008c74",
          700: "#006957",
          800: "#00463a",
          900: "#00231d",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        adsavings: {
          100: "#f3e8ff",
          500: "#a855f7",
        },
        quicksave: {
          100: "#dbeafe",
          500: "#3b82f6",
        },
        safelock: {
          100: "#d1fae5",
          500: "#10b981",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        typing: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        cursor: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
        slideIn: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        typing: "typing 2s steps(30, end)",
        cursor: "cursor 1s infinite",
        slideIn: "slideIn 0.5s ease-out forwards",
      }
    },
  },
  plugins: [],
};
