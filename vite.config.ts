import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { UserConfig as VitestConfig } from 'vitest'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  } as VitestConfig,
})
