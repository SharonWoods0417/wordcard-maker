/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'sans-serif'],
        'chinese': ['PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'sans-serif'],
        'english': ['Inter', 'system-ui', 'sans-serif'],
        'handwriting': ['Kalam', 'Comic Sans MS', 'Patrick Hand', 'Baloo 2', 'Fredoka', 'Schoolbell', 'sans-serif'],
      },
      colors: {
        'gradient-start': '#1e40af', // blue-800
        'gradient-mid': '#2563eb',   // blue-600  
        'gradient-end': '#9333ea',   // purple-600
      }
    },
  },
  plugins: [],
};
