/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
        'solana-blue': '#00C2FF',
        'solana-dark': '#050010',
      },
      animation: {
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s linear infinite',
        'scanlines': 'scanlines 8s linear infinite',
        'flicker': 'flicker 5s infinite alternate',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0%' },
          '100%': { backgroundPosition: '0 100%' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
