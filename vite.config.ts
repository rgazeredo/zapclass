import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
            // Não gerar tipos automaticamente durante o build
            // Os tipos devem ser gerados antes do build com: php artisan wayfinder:generate --with-form
            generate: false,
        }),
    ],
    server: {
        host: 'localhost',
        port: 5173,
    },
    esbuild: {
        jsx: 'automatic',
    },
});
