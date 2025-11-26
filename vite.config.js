import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose the server to the network
    host: true, 
    // Set the desired port
    port: 3002,
    // Enable HTTPS and provide the certificate files
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '192.167.12.85-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '192.167.12.85.pem')),
    },
  },
})
