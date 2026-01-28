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
        ep: {
          purple: '#533483',
          blue: '#0f3460',
          navy: '#16213e',
          dark: '#1a1a2e',
          red: '#e94560',
        }
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'serif'],
      }
    },
  },
  plugins: [],
};
export default config;
