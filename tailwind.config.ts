import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1EA',
        'cream-dark': '#EEE7DA',
        'bg-white': '#FFFFFF',
        navy: {
          DEFAULT: '#0F1B2D',
          deep: '#0A1322',
        },
        'text-secondary': '#4A5568',
        'text-muted': '#7A8597',
        accent: {
          green: '#2E4F3E',
          'green-hover': '#1F3A2C',
          'green-light': '#E8F0EA',
        },
        'border-soft': '#E8E2D7',
        'border-line': '#D9D2C2',
        success: '#2E7D5B',
        warning: '#C68B3C',
        error: '#B43D3D',
        gold: '#C9A65F',
      },
      fontFamily: {
        heading: ['var(--font-lora)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h1': ['44px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'h2': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '24px',
        'btn': '12px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(15,27,45,0.04), 0 4px 12px rgba(15,27,45,0.06)',
        'card': '0 2px 6px rgba(15,27,45,0.05), 0 8px 24px rgba(15,27,45,0.07)',
        'lift': '0 4px 12px rgba(15,27,45,0.08), 0 16px 40px rgba(15,27,45,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out',
        'slide-up': 'slideUp 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
