import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Overbooking/', // Esto es importante para que las rutas en GitHub Pages funcionen bien
});
