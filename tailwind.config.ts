import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        heading: ['"Space Grotesk"', "sans-serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      colors: {
        surface: "#17171b",
        border: "#27272e",
        muted: "#8b8b96",
        accent: "#3b82f6",
        "accent-dim": "rgba(59,130,246,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
