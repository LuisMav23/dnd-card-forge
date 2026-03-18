import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#c9a84c', light: '#e8c96a', dark: '#7a5e18' },
        parch: '#f5e9c8',
        ink: '#1a0f00',
        bg: '#080602',
        panel: '#100c05',
        mid: '#140e06',
        bdr: { DEFAULT: '#2a1e08', '2': '#3a2a0c' },
      },
    },
  },
  plugins: [],
};

export default config;
