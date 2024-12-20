import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontFamily: {
            sans: ['var(--font-inter)', 'sans-serif'],
        },
        extend: {
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
                fadeIn: {
                    '0%': {
                        opacity: '0'
                    },
                    '100%': {
                        opacity: '1'
                    },
                },
                fadeOut: {
                    '0%': {
                        opacity: '1'
                    },
                    '100%': {
                        opacity: '0'
                    },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.6s ease-in forwards',
                fadeOut: 'fadeOut 0.6s ease-out forwards',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;