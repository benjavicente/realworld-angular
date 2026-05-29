import { QueryClient } from '@benjavicente/angular-query-experimental';
import { createRouter } from '@benjavicente/angular-router-experimental';
import { ofetch } from 'ofetch';
import { environment } from './environments/environment';
import { routeTree } from './routeTree.gen';
import { createCartClientStore } from './routes/(shop)/-store/cart-client.store';

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: import.meta.env.SSR ? false : true,
        staleTime: 1000,
        gcTime: 1000 * 60,
        retry: false,
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
    scrollRestoration: true,
  });
}

declare module '@benjavicente/angular-router-experimental' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
