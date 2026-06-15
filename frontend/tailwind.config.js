/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2f9',
          100: '#d6e0f0',
          200: '#aec1e0',
          300: '#85a2d0',
          400: '#4d6fa8',
          500: '#2d4a7c',
          600: '#1f3760',
          700: '#172a48',
          800: '#101d32',
          900: '#0a121f',
        },
        accent: {
          50: '#fff3ee',
          100: '#ffe2d6',
          200: '#ffbfa3',
          300: '#ff9b70',
          400: '#ff7c4d',
          500: '#fb5d2f',
          600: '#e0461c',
          700: '#b73516',
          800: '#8c2811',
          900: '#601a0b',
        },
        surface: {
          light: '#f7f5f2',
          dark: '#0d1420',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
