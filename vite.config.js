import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
    // SPA routing uchun history fallback
    historyApiFallback: true,
  },
  preview: {
    port: 3000,
    // Preview mode uchun ham history fallback
    historyApiFallback: true,
  },
  build: {
    // Build vaqtida ham routing ishlashi uchun
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})