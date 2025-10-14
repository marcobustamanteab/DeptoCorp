import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@deptocorp/shared': path.resolve(__dirname, '../../packages/shared'),
      '@deptocorp/supabase-client': path.resolve(__dirname, '../../packages/supabase-client/src'),
    },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
})