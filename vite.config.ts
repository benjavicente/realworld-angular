import { angular } from '@oxc-angular/vite';
import { tanstackStart } from '@benjavicente/angular-start-experimental/plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import '@angular/compiler';

const TSS_ROUTER_BASEPATH = '';
const TSS_SERVER_FN_BASE = '/_serverFn/';

const ANGULAR_PACKAGES = [
  '@angular/cdk',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/platform-browser',
  '@angular/platform-server',
] as const;

export default defineConfig(({ mode }) => ({
  server: {
    port: 4200,
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('@angular/'),
  },
  ssr: {
    noExternal: ['@angular/compiler'],
  },
  resolve: {
    dedupe: [
      ...ANGULAR_PACKAGES,
      '@benjavicente/angular-query',
      '@benjavicente/angular-router-experimental',
      '@benjavicente/angular-router-devtools',
      '@benjavicente/angular-start-experimental',
      '@benjavicente/angular-start-experimental-client',
      '@benjavicente/angular-start-experimental-server',
      '@tanstack/angular-form',
      'rxjs',
    ],
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
    angular({
      tsconfig: 'tsconfig.app.json',
      liveReload: mode !== 'test',
      sourceMap: mode !== 'test',
      zoneless: true,
    }),
    tailwindcss(),
  ],
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    pool: 'threads',
    maxWorkers: 4,
    reporters: ['default'],
  },
}));
