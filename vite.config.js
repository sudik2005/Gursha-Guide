import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        recipes: resolve(__dirname, 'recipes.html'),
        recipeDetail: resolve(__dirname, 'recipe-detail.html'),
        login: resolve(__dirname, 'login.html'),
        subscription: resolve(__dirname, 'subscription.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
