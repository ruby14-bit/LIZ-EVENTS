import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      // This helps the bundler find the exact entry points for Firebase
      'firebase/app': 'firebase/app',
      'firebase/auth': 'firebase/auth',
      'firebase/firestore': 'firebase/firestore', // add this if you use firestore
    },
  },
  optimizeDeps: {
    // This forces Vite to pre-bundle Firebase for better compatibility
    include: ['firebase/app', 'firebase/auth'],
  },
})
