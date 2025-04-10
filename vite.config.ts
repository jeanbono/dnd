import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/dnd/', // très important pour GitHub Pages
  plugins: [vue(), tailwind()],
})
