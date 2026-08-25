/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ["'IBM Plex Mono'", 'monospace'],
      },
      colors: {
        ink: '#14231C',
        bg: '#F7F8F5',
        surface: '#FFFFFF',
        border: '#E4E7DF',
        muted: '#5C6B62',

        // Primary brand (replaces the old blue "brand" palette)
        brand: {
          50: '#E7F1EA', 100: '#D3E5D9', 200: '#B0D0BC', 300: '#8AB89E',
          400: '#5D9975', 500: '#2F6F4E', 600: '#26603F', 700: '#1F4D36',
          800: '#193F2C', 900: '#14321F', 950: '#0C1F14',
        },
        primary: {
          DEFAULT: '#2F6F4E',
          dark: '#1F4D36',
          light: '#E7F1EA',
        },

        // Accent / gold (used for warm highlights)
        accent: {
          50: '#FBF1DE', 100: '#F6E3BD', 200: '#EDC98A', 300: '#E3AF5C',
          400: '#D89C3D', 500: '#C98A2C', 600: '#B37723', 700: '#8F5E1B',
          800: '#6E4815', 900: '#55370F', 950: '#33200A',
        },
        gold: {
          DEFAULT: '#C98A2C',
          light: '#FBF1DE',
        },

        // Neutral scale (replaces default slate throughout the app)
        slate: {
          50: '#F7F8F5', 100: '#EFF1EA', 200: '#E4E7DF', 300: '#C9CEC2',
          400: '#A3AA99', 500: '#7C8574', 600: '#5C6B62', 700: '#445045',
          800: '#2E3830', 900: '#1C241E', 950: '#14231C',
        },

        // Success (kept close to primary green family)
        emerald: {
          50: '#EFF7F1', 100: '#DCEEE0', 200: '#BFE0C7', 300: '#98CDA5',
          400: '#6BB47F', 500: '#3F9760', 600: '#2F6F4E', 700: '#245A3F',
          800: '#1D4733', 900: '#173A29', 950: '#0D2318',
        },
        success: { 50: '#EFF7F1', 500: '#3F9760', 600: '#2F6F4E', 700: '#245A3F' },

        // Warning (gold family)
        amber: {
          50: '#FBF1DE', 100: '#F6E3BD', 200: '#EDC98A', 300: '#E3AF5C',
          400: '#D89C3D', 500: '#C98A2C', 600: '#B37723', 700: '#8F5E1B',
          800: '#6E4815', 900: '#55370F', 950: '#33200A',
        },
        warning: { 50: '#FBF1DE', 500: '#C98A2C', 600: '#B37723', 700: '#8F5E1B' },

        // Danger (rust "leak" family)
        red: {
          50: '#F7E7E0', 100: '#F0D2C4', 200: '#E2AC93', 300: '#D28563',
          400: '#C3663F', 500: '#B14A2C', 600: '#98391F', 700: '#7A2E19',
          800: '#602414', 900: '#491B0F', 950: '#2B0F08',
        },
        danger: { 50: '#F7E7E0', 500: '#B14A2C', 600: '#98391F', 700: '#7A2E19' },
        leak: { DEFAULT: '#B14A2C', light: '#F7E7E0' },

        // Info / misc accent (muted blue-green, used sparingly)
        blue: {
          50: '#EEF3F6', 100: '#DCE7ED', 200: '#B8CFDB', 300: '#93B7C8',
          400: '#6D9FB5', 500: '#4A85A0', 600: '#3A6C83', 700: '#2F5768',
          800: '#26454F', 900: '#1C333B', 950: '#101E23',
        },
        teal: {
          50: '#EAF4F1', 100: '#D2E8E1', 200: '#A8D2C3', 300: '#7CBBA5',
          400: '#52A488', 500: '#2F8D6F', 600: '#23735A', 700: '#1C5C48',
          800: '#164938', 900: '#123829', 950: '#0A2118',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 35, 28, 0.04), 0 8px 24px -12px rgba(20, 35, 28, 0.12)',
      },
      borderRadius: {
        xl: '0.85rem',
        '2xl': '1.1rem',
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: 0, transform: 'translateX(16px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%, 100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-16px) scale(1.04)' } },
        'float-slow': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(12px)' } },
        'gradient-pan': { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
      },
    },
  },
  plugins: [],
}
