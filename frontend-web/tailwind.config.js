/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        macau: {
          deep: '#005d50',
          ink: '#00473f',
          mist: '#edf7f5',
          line: '#dce9e7',
        },
      },
      boxShadow: {
        nav: '0 18px 35px rgba(37, 78, 85, 0.18), 0 2px 8px rgba(14, 56, 55, 0.08)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Microsoft YaHei"',
          '"PingFang SC"',
          'sans-serif',
        ],
        serifCn: ['"Songti SC"', '"SimSun"', 'serif'],
      },
    },
  },
  plugins: [],
};
