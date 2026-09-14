import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        obsidian: {
          950: "#050505",
          900: "#0A0A0A",
          850: "#0F0F0F",
          800: "#141414",
          700: "#1A1A1A",
          600: "#222222",
          500: "#2A2A2A",
        },
        pearl: {
          50: "#FFFFFF",
          100: "#FDFBF7",
          200: "#F5F2EB",
          300: "#E5E1D8",
          400: "#C4C0B6",
          500: "#A1A1A6",
        },
        accent: {
          cyan: "#38BDF8",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          violet: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"Geist Mono"',
          '"Fira Code"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderColor: {
        hairline: "#1F1F1F",
        "hairline-light": "#2A2A2A",
      },
    },
  },
  plugins: [],
};

export default config;
