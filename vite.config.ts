import { defineConfig } from 'vite';

// Base path for GitHub Pages deployment.
// Set via env variable VITE_BASE_PATH or default to '/'.
// Example: VITE_BASE_PATH=/footnotes/ npm run build
export default defineConfig({
    base: process.env.VITE_BASE_PATH || '/',
});
