/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  },
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f6fa',
          100: '#dce9f2',
          200: '#b8d3e5',
          300: '#75A2BF',
          400: '#5E8CAD',
          500: '#43759D',
          600: '#2F5F8A',
          700: '#174B73',
          800: '#003B65',
          900: '#002a47',
          primary: '#003B65',
          'primary-hover': '#174B73',
          secondary: '#5E8CAD',
          accent: '#75A2BF',
          background: '#FFFFFF',
          'background-alt': '#F4F7FA',
          text: '#1e293b',
          'text-muted': '#64748b',
          dark: '#0a1628',
          surface: '#ffffff',
          'surface-dark': '#0f1d2e',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(0, 59, 101, 0.12)',
        card: '0 4px 24px rgba(0, 59, 101, 0.08)',
        glow: '0 0 40px rgba(117, 162, 191, 0.25)',
        'brand-primary': '0 4px 14px rgba(0, 59, 101, 0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #003B65 0%, #2F5F8A 50%, #75A2BF 100%)',
        'gradient-hero': 'linear-gradient(180deg, rgba(0,59,101,0.85) 0%, rgba(0,59,101,0.95) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'count-up': 'countUp 2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
