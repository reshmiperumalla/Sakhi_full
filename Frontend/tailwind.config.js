/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F7F8F5',
          50: '#FFFFFF',
          100: '#F7F8F5',
          200: '#EFEFEA',
        },
        primary: {
          50: '#F0F6F4',
          100: '#DDEDE7',
          200: '#B8D8CE',
          500: '#1F8571',
          600: '#176B5B', // Deep teal / muted green
          700: '#125447',
          800: '#0E4036',
          900: '#092922',
          DEFAULT: '#176B5B',
        },
        sage: {
          50: '#F5FAF8',
          100: '#DDEDE7',
          200: '#C2DFD4',
          DEFAULT: '#DDEDE7',
        },
        gold: {
          100: '#FCF7E8',
          200: '#F6EBC7',
          400: '#E8C766',
          500: '#D4B04C',
          DEFAULT: '#E8C766',
        },
        charcoal: {
          DEFAULT: '#263238',
          900: '#1E293B',
          800: '#263238',
          700: '#374151',
        },
        subtle: {
          DEFAULT: '#667085',
          light: '#94A3B8',
        },
        borderNeutral: {
          DEFAULT: '#E3E7E4',
          dark: '#CBD5E1',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          600: '#C54B4B',
          DEFAULT: '#C54B4B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card': '0 2px 6px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
      }
    },
  },
  plugins: [],
}
