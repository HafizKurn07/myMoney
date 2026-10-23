/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          brand: '#18784E', // exact shade from wireframe
          brandDark: '#125C3C',
          brandLight: '#E8F5EE',
        },
        surface: {
          light: '#F5F7F6',
          card: '#FFFFFF',
          darkBg: '#0F172A',
          darkCard: '#1E293B',
          darkBorder: '#334155',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        'float': '0 10px 25px -5px rgba(24, 120, 78, 0.35)',
      }
    },
  },
  plugins: [],
}
