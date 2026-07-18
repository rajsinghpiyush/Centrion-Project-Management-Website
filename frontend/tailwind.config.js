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
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Deep dark bases
                dark: {
                    base: '#080C16',
                    surface: '#111729',
                    elevated: '#1A2235',
                    border: 'rgba(255,255,255,0.08)',
                },
                // Light mode elegant bases
                light: {
                    base: '#F8FAFC',
                    surface: '#FFFFFF',
                    elevated: '#F1F5F9',
                    border: 'rgba(0,0,0,0.08)',
                },
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                accent: {
                    mint: '#14B8A6',
                    turquoise: '#06B6D4',
                    gold: '#F59E0B',
                    purple: '#8B5CF6',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'fade-out': 'fadeOut 0.3s ease-in forwards',
                'slide-in': 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'drift': 'drift 20s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)' },
                },
                drift: {
                    '0%': { backgroundPosition: '0% 0%' },
                    '100%': { backgroundPosition: '100% 100%' },
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
                'bento': '0 4px 24px -4px rgba(0,0,0,0.05), 0 2px 8px -2px rgba(0,0,0,0.02)',
                'bento-dark': '0 4px 24px -4px rgba(0,0,0,0.4), 0 2px 8px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
            }
        },
    },
    plugins: [],
}
