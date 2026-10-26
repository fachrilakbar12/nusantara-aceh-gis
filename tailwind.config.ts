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
        aceh: {
          bg: '#0b1220',
          panel: '#121a2b',
          panelAlt: '#182238',
          border: '#25324d',
          text: '#f3efe6',
          muted: '#93a0ba'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
