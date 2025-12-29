import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Дозволяє з'єднання ззовні контейнера
    port: 5173,
    watch: {
      usePolling: true, // Необхідно для Docker на Windows/Mac
      interval: 3000, // Перевірка змін кожну секунду
    },
    hmr: {
      host: 'localhost', // Для HMR через localhost
      port: 5173,
    },
  },
})
