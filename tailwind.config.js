/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#38bdf8', // primary-400
          DEFAULT: '#0284c7', // primary-600
          dark: '#075985', // primary-800
        },
        accent: {
          light: '#a78bfa', // violet-400
          DEFAULT: '#8b5cf6', // violet-500
          dark: '#7c3aed', // violet-600
        },
        neutral: {
          50: '#f8fafc',  // secondary-50
          100: '#f1f5f9', // secondary-100
          200: '#e2e8f0', // secondary-200
          300: '#cbd5e1', // secondary-300
          400: '#94a3b8', // secondary-400
          500: '#64748b', // secondary-500
          600: '#475569', // secondary-600
          700: '#334155', // secondary-700
          800: '#1e293b', // secondary-800
          900: '#0f172a', // secondary-900
        },
        success: '#22c55e', // green-500
        warning: '#f59e0b', // amber-500
        danger: '#ef4444',  // red-500
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    },
  },
  plugins: [],
}