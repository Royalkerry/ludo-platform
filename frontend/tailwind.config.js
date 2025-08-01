/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontSize: {
      base: '14px',
    },
    extend: {
      colors: {
        primary: '#ef320a',
      },
      gridTemplateColumns: {
        15: 'repeat(15, minmax(0, 1fr))',  // 👈 required
      },
      gridTemplateRows: {
        15: 'repeat(15, minmax(0, 1fr))',  // 👈 required
      },
    },
  },
  plugins: [],
};
