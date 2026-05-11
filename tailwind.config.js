/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tiffany: {
          DEFAULT: "#0ABAB5",
          50: "#e6fafa",
          100: "#b3f0ef",
          200: "#80e6e4",
          300: "#4ddcd9",
          400: "#26d2ce",
          500: "#0ABAB5",
          600: "#089e9a",
          700: "#06827e",
          800: "#046662",
          900: "#024a47",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#fdf8e7",
          100: "#f8edb8",
          200: "#f3e189",
          300: "#eed55a",
          400: "#e9c93b",
          500: "#D4AF37",
          600: "#b8962f",
          700: "#9c7d27",
          800: "#80641f",
          900: "#644b17",
        },
        bg: {
          primary: "#080B0F",
          secondary: "#0D1117",
          card: "#111827",
          elevated: "#1a2234",
          border: "#1e2d3d",
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
      },
    },
  },
  plugins: [],
}
