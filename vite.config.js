import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webcrypto } from 'crypto';

const crypto = webcrypto;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
