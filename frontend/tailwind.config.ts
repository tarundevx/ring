import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ringbg: "#111111",      // The deep dark background for the content
        ringcard: "#191919",    // The slightly lighter dark for sidebar and inputs
        ringborder: "#292929",  // Subtle border color
        ringaccent: "#10b981",  // Subtle emerald green
        ringaccenthover: "#059669" // Darker emerald for hover
      }
    }
  },
  plugins: []
};

export default config;

