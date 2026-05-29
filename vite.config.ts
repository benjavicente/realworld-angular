import { angular } from '@oxc-angular/vite';
import { tanstackStart } from '@benjavicente/angular-start-experimental/plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const TSS_ROUTER_BASEPATH = '';
const TSS_SERVER_FN_BASE = '/_serverFn/';

export default defineConfig(({ mode }) => ({
  server: {
    port: 4200,
  },
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    'process.env.TSS_ROUTER_BASEPATH': JSON.stringify(TSS_ROUTER_BASEPATH),
    'process.env.TSS_SERVER_FN_BASE': JSON.stringify(TSS_SERVER_FN_BASE),
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  plugins: [
    tanstackStart({
      srcDirectory: 'src',
      spa: {
        enabled: true,
        prerender: {
          // Cloudflare Workers SPA mode serves /index.html for unmatched routes.
          outputPath: '/index.html',
        },
      },
    }),
    angular({ tsconfig: 'tsconfig.app.json' }),
    tailwindcss(),
  ],
}));
