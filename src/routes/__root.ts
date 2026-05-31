import { Component } from '@angular/core';
import { TanStackRouterDevtools } from '@benjavicente/angular-router-devtools';
import { Outlet, createRootRouteWithContext } from '@benjavicente/angular-router-experimental';
import type { AngularInjectFn } from '@benjavicente/angular-router-experimental';
import type { QueryClient } from '@benjavicente/angular-query';
import type { ApiFetch } from '../lib/http/api-client';
import type { CartClientStore } from './(shop)/-store/cart-client.store';
import { Header } from './-components/header/header';
import { Footer } from './-components/footer/footer';
import { NotFound } from './-components/not-found/not-found';
import { images } from '../lib/assets';
import { environment } from '../environments/environment';
import stylesUrl from '../styles.css?url';
import fontUrl from '@fontsource/geist/files/geist-latin-400-normal.woff2?url';

const siteTitle = 'Fakeworld Angular playground';
const siteDescription =
  'A fork of RealWorld Angular, refactored to be as less "Angular" as possible while still being Angular.';

export const Route = createRootRouteWithContext<{
  inject: AngularInjectFn;
  queryClient: QueryClient;
  apiFetch: ApiFetch;
  cart: CartClientStore;
}>()({
  ssr: false,
  head: () => ({
    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      { title: siteTitle },
      { name: 'description', content: siteDescription },
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Fakeworld Angular' },
      { property: 'og:image', content: images.heroBanner },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: siteTitle },
      { name: 'twitter:description', content: siteDescription },
      { name: 'twitter:image', content: images.heroBanner },
    ],
    links: [
      { rel: 'preconnect', href: environment.apiBaseUrl, crossorigin: 'anonymous' },
      { rel: 'preload', href: fontUrl, as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      { rel: 'icon', href: images.faviconSvg, type: 'image/svg+xml' },
      { rel: 'stylesheet', href: stylesUrl },
    ],
  }),
  component: () => RootComponent,
  notFoundComponent: () => NotFound,
});

@Component({
  selector: 'rw-start-root',
  standalone: true,
  imports: [Outlet, Header, Footer, TanStackRouterDevtools],
  template: `
    <a
      class="absolute -top-full left-4 z-(--z-modal) rounded-md bg-primary px-4 py-2 font-semibold text-text-on-primary no-underline transition-[top] focus:top-4"
      href="#main-content"
      >Skip to main content</a
    >
    <rw-header />
    <main
      id="main-content"
      class="min-h-[calc(100vh-var(--spacing-nav)-80px)] outline-none"
      tabindex="-1"
    >
      <outlet />
    </main>
    <rw-footer />
    <router-devtools />
  `,
})
class RootComponent {}
