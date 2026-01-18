import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f2f7ff",
          100: "#e4edff",
          200: "#c2d8ff",
          300: "#9dc0ff",
          400: "#6e9bff",
          500: "#3b6bff",
          600: "#2d52db",
          700: "#2441ad",
          800: "#1f368c",
          900: "#1b2f73"
        }
      }
    }
  },
  plugins: []
};

export default config;
