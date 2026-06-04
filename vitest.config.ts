import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', 'landing/**', 'landing page/**'],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
