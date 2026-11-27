/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d9e2ee',
          200: '#b3c5dd',
          300: '#8aa5c8',
          400: '#5f7ea6',
          500: '#3f5f8a',
          600: '#2f4a70',
          700: '#26395a',
          800: '#1c2a43',
          900: '#14203a',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 32, 58, 0.06), 0 1px 3px rgba(20, 32, 58, 0.08)',
      },
    },
  },
  plugins: [],
};
