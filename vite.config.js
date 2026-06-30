import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Format the base URL to always start and end with a slash
  const baseUrl = env.BASE_URL ? `/${env.BASE_URL.replace(/^\/|\/$/g, '')}/` : '/';
  
  return {
    base: baseUrl,
    plugins: [react(), tailwindcss(), cssInjectedByJsPlugin()],
  };
});
