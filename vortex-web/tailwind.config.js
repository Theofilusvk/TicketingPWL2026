/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent-color, #CBFF00)',
        secondary: '#FF4D4D',
        accent: '#FF4D4D',
        'background-light': '#f8f6f6',
        'background-dark': '#0a0a0a',
        'surface-dark': '#1a1a1a',
        'border-dark': '#333333',
        'dark-base': '#0a0a0a',
        'electric-lime': '#CBFF00',
        'hot-coral': '#FF4D4D',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"Public Sans"', 'sans-serif'],
        body: ['"DM Mono"', 'monospace'],
        mono: ['"DM Mono"', 'monospace'],
        'mono-tech': ['"DM Mono"', 'monospace'],
        accent: ['"Space Mono"', 'monospace'],
        tag: ['"Space Mono"', 'monospace'],
        label: ['"Space Mono"', 'monospace'],
        'mono-label': ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

