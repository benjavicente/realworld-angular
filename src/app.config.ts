import { ApplicationConfig, InjectionToken } from '@angular/core';
import {
  QueryClient,
  provideTanStackQuery,
  withNoQueryHydration,
} from '@benjavicente/angular-query';
import { APP_BASE_HREF } from '@angular/common';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { withDevtools } from '@benjavicente/angular-query-devtools';

const QUERY_CLIENT = new InjectionToken<QueryClient>('TanStackQueryClient', {
  providedIn: 'root',
  factory: () => injectRouter().options.context.queryClient,
});

export const appConfig: ApplicationConfig = {
  providers: [
    // Base href required for Angular Dialog
    { provide: APP_BASE_HREF, useValue: '/' },
    provideTanStackQuery(QUERY_CLIENT, withDevtools(), withNoQueryHydration()),
  ],
};
