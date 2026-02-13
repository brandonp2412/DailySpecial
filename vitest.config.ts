import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',
    
    // Enable globals like describe, it, expect
    globals: true,
    
    // Setup file to run before each test file
    setupFiles: ['./vitest-setup.ts'],
    
    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,svelte}'],
      exclude: [
        'src/**/*.{test,spec}.{js,ts,svelte}',
        'src/**/*.d.ts',
        'src/app.html',
      ],
    },
  },
  
  // Tell Vitest to use the `browser` entry points in `package.json` files
  resolve: process.env.VITEST
    ? {
        conditions: ['browser'],
      }
    : undefined,
});