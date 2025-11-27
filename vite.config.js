import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 3002,
    open: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '192.167.12.85-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '192.167.12.85.pem')),
    },
  },
})
