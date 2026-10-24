import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    // the prerender (prerender.tsx) runs in Node; gsap's plugin files are ES modules in a
    // CommonJS package, which Node will not import, so they are bundled into it instead
    ssr: { noExternal: ['gsap', '@gsap/react'] },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
