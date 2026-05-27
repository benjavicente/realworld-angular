import { ApplicationConfig, InjectionToken } from '@angular/core';
import { QueryClient, provideTanStackQuery } from '@benjavicente/angular-query-experimental';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import { withDevtools } from '@benjavicente/angular-query-devtools';

export const QUERY_CLIENT = new InjectionToken<QueryClient>('TanStackQueryClient', {
  providedIn: 'root',
  factory: () => injectRouter().options.context.queryClient,
});

export const appConfig: ApplicationConfig = {
  providers: [provideTanStackQuery(QUERY_CLIENT, withDevtools())],
};
