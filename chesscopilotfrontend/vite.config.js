import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Use '0.0.0.0' for Docker and Container Registry
    port: 5173,
  },
});