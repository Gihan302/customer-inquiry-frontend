import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Must match FRONTEND_URL in the backend .env, the only origin the API's CORS allows.
    port: 5173,
    strictPort: true,
  },
})
