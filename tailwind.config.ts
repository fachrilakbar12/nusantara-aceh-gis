import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        neon: '#a8ff60',
        'neon-dim': '#6fd13a',
        obsidian: '#05080a',
        panel: 'rgba(14, 20, 24, 0.55)'
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 20px rgba(168, 255, 96, 0.45)',
        'neon-lg': '0 0 34px rgba(168, 255, 96, 0.72)'
      }
    }
  },
  plugins: []
};

export default config;

