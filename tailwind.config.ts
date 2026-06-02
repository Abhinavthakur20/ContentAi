import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        'brand-black': '#0a0a0a',
        'off-white': '#f2ede6',
        acid: '#c8f23c',
        mid: '#6b6b6b',
        'border-muted': '#d4cfc8',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
