import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/game1/' : '/',
  plugins: [
    tailwindcss(),
  ],
}))
