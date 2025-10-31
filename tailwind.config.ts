import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--color-bg-primary)",
          muted: "var(--color-bg-muted)",
          elevated: "var(--color-bg-elevated)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          soft: "var(--color-surface-soft)",
          bright: "var(--color-surface-bright)",
        },
        foreground: {
          DEFAULT: "var(--color-foreground-primary)",
          muted: "var(--color-foreground-muted)",
          soft: "var(--color-foreground-soft)",
        },
        accent: {
          primary: "var(--color-accent-primary)",
          secondary: "var(--color-accent-secondary)",
          positive: "var(--color-accent-positive)",
          warning: "var(--color-accent-warning)",
          danger: "var(--color-accent-danger)",
        },
        outline: {
          DEFAULT: "var(--pixel-outline)",
          soft: "var(--pixel-outline-soft)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Inter",
          "-apple-system",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "monospace"],
        pixel: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        pixel: "8px 8px 0 0 rgba(0,0,0,0.4)",
        "pixel-glow": "0 0 0 4px rgba(111, 220, 255, 0.5)",
        "pixel-inset": "inset 4px 4px 0 0 rgba(0,0,0,0.3)",
        "pixel-soft": "6px 6px 0 0 rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        DEFAULT: "0",
        pixel: "0",
        "pixel-sm": "0",
        none: "0",
      },
      spacing: {
        3.5: "0.875rem",
        4.5: "1.125rem",
        7.5: "1.875rem",
        13: "3.25rem",
      },
      backgroundImage: {
        "pixel-radial":
          "radial-gradient(circle at 20% 20%, rgba(111,220,255,0.18), transparent 60%)",
        "pixel-glass":
          "linear-gradient(160deg, rgba(18,24,49,0.9), rgba(14,18,38,0.88))",
      },
      dropShadow: {
        glow: "0 0 12px rgba(111, 220, 255, 0.45)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "float-pixel": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(2px, -4px)" },
          "50%": { transform: "translate(-2px, -8px)" },
          "75%": { transform: "translate(-4px, -4px)" },
        },
        "crt-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.95" },
        },
        "scanline-flow": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "pulse-pixel": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        blink: {
          "0%, 49%, 100%": { opacity: "1" },
          "50%, 99%": { opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        "float-pixel": "float-pixel 4s steps(4) infinite",
        "crt-flicker": "crt-flicker 0.15s steps(2) infinite",
        "scanline-flow": "scanline-flow 14s linear infinite",
        "pulse-pixel": "pulse-pixel 2s steps(4) infinite",
        blink: "blink 1s steps(1) infinite",
      },
    },
  },
  plugins: [
    plugin(({ addVariant, addUtilities }) => {
      addVariant("hocus", ["&:hover", "&:focus-visible"]);

      addUtilities({
        ".pixel-outline": {
          boxShadow: "0 0 0 2px var(--pixel-outline), 0 12px 0 0 var(--pixel-shadow)",
        },
        ".pixel-outline-soft": {
          boxShadow: "0 0 0 1px var(--pixel-outline-soft)",
        },
        ".pixel-shimmer": {
          backgroundImage:
            "linear-gradient(110deg, rgba(255,255,255,0.05) 0%, rgba(111,220,255,0.25) 45%, rgba(255,255,255,0.05) 100%)",
          backgroundSize: "220% 100%",
        },
        ".pixel-glass": {
          backgroundImage:
            "linear-gradient(160deg, rgba(18,24,49,0.9), rgba(14,18,38,0.88))",
          backdropFilter: "blur(12px)",
        },
      });
    }),
  ],
};

export default config;

