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
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules/react')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) {
              return 'redux-vendor';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('node_modules/axios')) {
              return 'api-vendor';
            }
            // Component chunks
            if (id.includes('src/components')) {
              return 'ui-components';
            }
            // Hooks
            if (id.includes('src/hooks')) {
              return 'hooks';
            }
            // APIs
            if (id.includes('src/api')) {
              return 'api';
            }
            // Split admin pages into smaller chunks
            if (id.includes('src/pages/admin/Products')) {
              return 'admin-products';
            }
            if (id.includes('src/pages/admin/Orders')) {
              return 'admin-orders';
            }
            if (id.includes('src/pages/admin/ComboPack')) {
              return 'admin-combo';
            }
            if (id.includes('src/pages/admin/Dashboard')) {
              return 'admin-dashboard';
            }
            if (id.includes('src/pages/admin/HomeCMS')) {
              return 'admin-homecms';
            }
            if (id.includes('src/pages/admin')) {
              return 'admin-other';
            }
            // User pages chunk
            if (id.includes('src/pages/user')) {
              return 'pages-user';
            }
          },
        },
      },
    },
  };
});
