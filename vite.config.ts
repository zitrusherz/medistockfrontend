// vite.config.ts
/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    build: {
        rollupOptions: {
            output: {
                // Perf (carga general lenta): separa dependencias pesadas o
                // compartidas por varias páginas en chunks propios. Sin esto,
                // Rollup decide el split automáticamente por cada punto de
                // entrada lazy y suele repartir estas libs entre varios
                // chunks de página, inflando la descarga de cada una. Al
                // aislarlas, el navegador las descarga UNA vez y las
                // reutiliza (misma URL con hash) en el resto de la sesión.
                manualChunks(id) {
                    if (!id.includes('node_modules')) return
                    if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
                    if (id.includes('react-router')) return 'vendor-router'
                    if (id.includes('@tanstack')) return 'vendor-query'
                    if (id.includes('lucide-react')) return 'vendor-icons'
                    if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
                    return 'vendor'
                },
            },
        },
    },

    test: {
        environment: 'node',
    },
})
