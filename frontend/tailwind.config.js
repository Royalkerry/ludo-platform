/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      fontSize: {
        base: '14px',  // make text smaller everywhere
      },
      extend: {
        colors: {
          primary: '#ef320a',  // your brand color
        },
      },
    },
    
    plugins: [],
  };
  