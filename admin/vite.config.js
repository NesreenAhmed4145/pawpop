import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()],

  server: {
    // بورت الأدمن لوحده. الـ front عادةً على 5173، فخلّينا الأدمن على 5174
    // (غيّره لو الـ front بتاعك شغال على 5174)
    port: 5174,
    strictPort: true, // لو البورت مشغول يوقف بدل ما يختار بورت تاني من نفسه

    // بيحوّل أي طلب /api للباك إند فمش هتحتاج CORS وقت التطوير
    // غيّر البورت لو السيرفر بتاعك شغال على بورت تاني
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
  preview: {
    port: 5174, // لـ npm run preview بعد الـ build
  },
})