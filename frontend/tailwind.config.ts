import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ringbg: "#111111",      // The deep dark background for the content
        ringcard: "#191919",    // The slightly lighter dark for sidebar and inputs
        ringborder: "#292929",  // Subtle border color
        ringaccent: "#7c3aed",  // The purple accent color from the screenshot (similar to violet-600)
        ringaccenthover: "#6d28d9"
      }
    }
  },
  plugins: []
};

export default config;

