import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['GeistSans', 'sans-serif'],
      pixel: ['"Press Start 2P"', 'cursive'],
    },
    extend: {
      fontFamily: {
        sans: ['GeistSans', 'sans-serif'], // Default font
        pixel: ['"Press Start 2P"', 'cursive'], // Add the pixelated font
      },
      colors: {
        background: '#0A0B0D',
        foreground: '#F2F3F5',
        primary: {
          DEFAULT: '#FF4454',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2B2D31',
          foreground: '#F2F3F5',
        },
        accent: {
          DEFAULT: '#7289DA',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#1E1F22',
          foreground: '#A3A6AA',
        },
        card: {
          DEFAULT: '#18191C',
          foreground: '#F2F3F5',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;