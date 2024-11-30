import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        smash: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(0.8)", opacity: "0.5" },
          "100%": { transform: "scale(0.5)", opacity: "0" },
        },
      },
      animation: {
        smash: "smash 0.5s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
