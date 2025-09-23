import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Configurações otimizadas para produção
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', '@radix-ui/react-slot']
        }
      }
    },
    // Otimizações de performance
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  },
  // Configurações de servidor para produção
  server: {
    port: 3000,
    host: true,
    strictPort: true
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true
  },
  // Variáveis de ambiente
  envPrefix: 'VITE_',
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'react-router-dom',
      'lucide-react'
    ]
  }
})