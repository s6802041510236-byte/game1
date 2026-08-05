import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/game1/',
  plugins: [
    tailwindcss(),
  ],
})
