import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/

const socketURL = process.env.VITE_BACKEND_SOCKET_URL || "http://localhost:5000";
export default defineConfig({
  plugins: [react(),tailwindcss()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
})

// change it when upload in server 
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     historyApiFallback: true
//   }
// });