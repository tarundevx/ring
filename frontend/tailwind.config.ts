import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ringbg: "#09090B",
        ringcard: "#111116",
        ringaccent: "#4F46E5"
      }
    }
  },
  plugins: []
};

export default config;

