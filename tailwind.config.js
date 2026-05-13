/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff4f0",
          100: "#ffe5d9",
          200: "#ffc9b2",
          300: "#ffa07a",
          400: "#ff7a4d",
          500: "#f05a28",  // primary coral-orange from logo
          600: "#d94010",
          700: "#b53209",
          800: "#8f280a",
          900: "#6b1e09",
        },
        navy: {
          50:  "#f0f2ff",
          100: "#dde2ff",
          200: "#b8c2ff",
          300: "#8a97ff",
          400: "#5c6bff",
          500: "#3a4aed",
          600: "#2c3bd4",
          700: "#1e2aab",
          800: "#141c7a",  // deep navy from logo
          900: "#0a1050",
          950: "#050820",
        },
        dark: {
          bg:      "#0f1117",
          surface: "#161b27",
          card:    "#1c2333",
          border:  "#2a3347",
          muted:   "#374160",
        },
        light: {
          bg:      "#f7f8fc",
          surface: "#ffffff",
          card:    "#f1f3f9",
          border:  "#dde2ef",
          muted:   "#c8d0e7",
        },
        severity: {
          critical: "#ff3b5c",
          high:     "#ff7a2b",
          medium:   "#f5b800",
          low:      "#22c55e",
          info:     "#60a5fa",
        }
      },
      animation: {
        "spin-slow":   "spin 3s linear infinite",
        "pulse-brand": "pulse-brand 2s ease-in-out infinite",
        "slide-up":    "slideUp 0.4s ease-out",
        "fade-in":     "fadeIn 0.3s ease-out",
        "scan-bar":    "scanBar 2s ease-in-out infinite",
        "progress":    "progress 0.6s ease-out forwards",
      },
      keyframes: {
        "pulse-brand": {
          "0%, 100%": { opacity: 1 },
          "50%":       { opacity: 0.4 },
        },
        slideUp: {
          from: { transform: "translateY(12px)", opacity: 0 },
          to:   { transform: "translateY(0)",    opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        scanBar: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        progress: {
          from: { width: "0%" },
        },
      },
      backgroundImage: {
        "grid-dark": "radial-gradient(circle, #2a3347 1px, transparent 1px)",
        "grid-light": "radial-gradient(circle, #c8d0e7 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(135deg, #f05a28 0%, #d94010 100%)",
        "navy-gradient":  "linear-gradient(135deg, #141c7a 0%, #0a1050 100%)",
      },
    },
  },
  plugins: [],
}
