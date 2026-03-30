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
      keyframes: {
        'landing-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'landing-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'landing-shimmer': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'landing-fade-up': 'landing-fade-up 0.75s ease-out forwards',
        'landing-fade-in': 'landing-fade-in 0.85s ease-out forwards',
        'landing-shimmer': 'landing-shimmer 10s ease-in-out infinite',
      },
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
