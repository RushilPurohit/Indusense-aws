/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chrome: {
          header: '#0B132B',
          toolbar: '#1C2541',
          well: '#1E293B',
          border: '#334155',
        },
        canvas: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          recessed: '#F1F5F9',
          border: '#E2E8F0',
          separator: '#CBD5E1',
        },
        primary: {
          DEFAULT: '#0284C7',
          hover: '#0369A1',
          active: '#075985',
          ring: '#38BDF8',
          wash: '#E0F2FE',
          link: '#2563EB',
          trace: '#0EA5E9',
        },
        status: {
          healthy: '#059669',
          healthyBg: '#ECFDF5',
          warning: '#D97706',
          warningBg: '#FFFBEB',
          critical: '#DC2626',
          criticalBg: '#FEF2F2',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0B132B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(11,19,43,0.04)',
        'flyout': '0 4px 6px -1px rgba(11,19,43,0.07)',
      },
      borderRadius: {
        'control': '4px',
        'card': '8px',
      }
    },
  },
  plugins: [],
}
