import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        line: "var(--color-line)"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        fa: ["var(--font-fa)"]
      },
      maxWidth: {
        prose: "70ch"
      },
      letterSpacing: {
        tightest: "-0.04em"
      }
    }
  },
  plugins: []
};

export default config;
