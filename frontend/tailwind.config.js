/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                // Dark surface scale
                gray: {
                    950: '#0a0b0f',
                    900: '#111318',
                    850: '#161920',
                    800: '#1c1f2a',
                    750: '#212535',
                    700: '#2a2f42',
                    600: '#3a3f57',
                    500: '#525773',
                    400: '#7c82a0',
                    300: '#a0a5bf',
                    200: '#c4c8da',
                    100: '#e2e4ef',
                    50: '#f0f1f7',
                },
                indigo: {
                    950: '#1e1b4b',
                    900: '#312e81',
                    800: '#3730a3',
                    700: '#4338ca',
                    600: '#4f46e5',
                    500: '#6366f1',
                    400: '#818cf8',
                    300: '#a5b4fc',
                    200: '#c7d2fe',
                    100: '#e0e7ff',
                    50: '#eef2ff',
                },
                violet: {
                    600: '#7c3aed',
                    500: '#8b5cf6',
                    400: '#a78bfa',
                    300: '#c4b5fd',
                },
                emerald: {
                    600: '#059669',
                    500: '#10b981',
                    400: '#34d399',
                    300: '#6ee7b7',
                },
                rose: {
                    600: '#e11d48',
                    500: '#f43f5e',
                    400: '#fb7185',
                    300: '#fda4af',
                },
                amber: {
                    600: '#d97706',
                    500: '#f59e0b',
                    400: '#fbbf24',
                    300: '#fcd34d',
                },
                cyan: {
                    500: '#06b6d4',
                    400: '#22d3ee',
                    300: '#67e8f9',
                },
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2)',
                'glow-violet': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)',
                'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
                'card': '0 1px 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.4)',
                'input': '0 0 0 3px rgba(99, 102, 241, 0.15)',
                'btn': '0 4px 15px rgba(99, 102, 241, 0.4)',
                'danger': '0 4px 15px rgba(244, 63, 94, 0.4)',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'shimmer': 'shimmer 2s linear infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
                'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
                'count-up': 'countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.92)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                countUp: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
        },
    },
    plugins: [],
}
