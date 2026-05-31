import { QueryClient } from '@benjavicente/angular-query';
import { createRouter } from '@benjavicente/angular-router-experimental';
import { ofetch } from 'ofetch';
import { environment } from './environments/environment';
import { routeTree } from './routeTree.gen';
import { createCartClientStore } from './routes/(shop)/-store/cart-client.store';

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 5,
        gcTime: import.meta.env.SSR ? Infinity : 1000 * 60,
        retry: import.meta.env.SSR ? false : true,
      },
    },
  });

  const apiFetch = ofetch.create({
    baseURL: environment.apiBaseUrl,
    credentials: 'include',
    retry: 0,
  });

  const cart = createCartClientStore();

  return createRouter({
    context: { queryClient, apiFetch, cart },
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingMinMs: 0,
    scrollRestoration: true,
  });
}

declare module '@benjavicente/angular-router-experimental' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
