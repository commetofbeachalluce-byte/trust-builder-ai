import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // LAN上のスマホからアクセス可能に
    port: 5173,
    proxy: {
      // /api へのリクエストをバックエンドに転送（スマホからも使える）
      '/api': {
        target: 'http://localhost:3020',
        changeOrigin: true,
      }
    }
  }
})
