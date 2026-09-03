import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--accent-primary)",
          foreground: "var(--text-inverse)",
        },
        "text-dark": "var(--petdex-text)",
        "text-muted": "var(--petdex-text-muted)",
        destructive: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
