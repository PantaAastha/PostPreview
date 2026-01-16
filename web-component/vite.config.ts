import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                entryFileNames: 'postpreview.js',
                chunkFileNames: 'postpreview-[name].js',
                assetFileNames: 'postpreview.[ext]',
            },
        },
    },
    server: {
        port: 5173,
        cors: true,
    },
    preview: {
        port: 4444,
        cors: true,
    },
});
