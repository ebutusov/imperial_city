import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs, so the built `dist/` folder works from any sub-path
  // (GitHub Pages, a sub-folder on a server), not just the domain root.
  base: './',
  build: {
    // three.js alone is ~600 kB minified (~170 kB gzipped). That is expected for a 3D app,
    // so raise the warning threshold instead of splitting a single-page scene into chunks.
    chunkSizeWarningLimit: 800,
  },
});
