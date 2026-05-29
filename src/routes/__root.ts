import { Component } from '@angular/core';
import { Outlet, createRootRouteWithContext } from '@benjavicente/angular-router-experimental';
import type { AngularInjectFn } from '@benjavicente/angular-router-experimental';
import type { QueryClient } from '@benjavicente/angular-query-experimental';
import type { ApiFetch } from '../lib/http/api-client';
import type { CartClientStore } from './(shop)/-store/cart-client.store';
import { Header } from './-components/header/header';
import { Footer } from './-components/footer/footer';
import { NotFound } from './-components/not-found/not-found';
import { authUserQueryOptions } from '../lib/services/auth';
import { images } from '../lib/assets';
import stylesUrl from '../styles.css?url';

export const Route = createRootRouteWithContext<{
  inject: AngularInjectFn;
  queryClient: QueryClient;
  apiFetch: ApiFetch;
  cart: CartClientStore;
}>()({
  beforeLoad: ({ context }) =>
    context.queryClient.ensureQueryData(authUserQueryOptions(context.apiFetch)),
  head: () => ({
    meta: [
      { title: 'Realworld Angular' },
      { name: 'description', content: 'Realworld Angular running on Angular Start.' },
    ],
    links: [
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
  imports: [Outlet, Header, Footer],
  template: `
    <a
      class="absolute -top-full left-4 z-[var(--z-modal)] rounded-md bg-primary px-4 py-2 font-semibold text-text-on-primary no-underline transition-[top] focus:top-4"
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
  `,
})
class RootComponent {}
