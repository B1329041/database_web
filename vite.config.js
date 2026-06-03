import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nojo/',
  server: {
    proxy: {
      // 將所有 /api 開頭的請求代理到後端伺服器 (這裡預設為 localhost:3000)
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true,
      }
    }
  }
})
