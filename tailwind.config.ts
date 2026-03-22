import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          light: 'rgb(var(--color-gold-light) / <alpha-value>)',
          dark: 'rgb(var(--color-gold-dark) / <alpha-value>)',
        },
        parch: 'rgb(var(--color-parch) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        mid: 'rgb(var(--color-mid) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        bronze: 'rgb(var(--color-bronze) / <alpha-value>)',
        placeholder: 'rgb(var(--color-placeholder) / <alpha-value>)',
        prev: 'rgb(var(--color-prev) / <alpha-value>)',
        bdr: {
          DEFAULT: 'rgb(var(--color-bdr) / <alpha-value>)',
          '2': 'rgb(var(--color-bdr-2) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
