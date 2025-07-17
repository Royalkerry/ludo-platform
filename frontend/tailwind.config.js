/** @type {import('tailwindcss').Config} */
module.exports = {
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
  