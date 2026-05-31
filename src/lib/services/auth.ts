import { queryOptions } from '@benjavicente/angular-query';
import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';
import type { ApiFetch } from '../http/api-client';
import type { User } from '../models/user.model';
import type { QueryClient } from '@benjavicente/angular-query';
import type { AsyncStorage } from '@tanstack/query-persist-client-core';

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

const authStorage: AsyncStorage | undefined = import.meta.env.SSR
  ? undefined
  : {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
      removeItem: (key) => window.localStorage.removeItem(key),
      entries: () => {
        const entries: Array<[string, string]> = [];
        for (let index = 0; index < window.localStorage.length; index++) {
          const key = window.localStorage.key(index);
          if (key) {
            const value = window.localStorage.getItem(key);
            if (value !== null) {
              entries.push([key, value]);
            }
          }
        }
        return entries;
      },
    };

const authQueryPersister = experimental_createQueryPersister({
  storage: authStorage,
  maxAge: ONE_DAY,
  prefix: 'realworld-angular-auth',
  filters: {
    queryKey: ['auth', 'user'],
    exact: true,
  },
});

export function authUserQueryOptions(apiFetch: ApiFetch) {
  return queryOptions({
    retry: false,
    staleTime: ONE_HOUR,
    persister: authQueryPersister.persisterFn,
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      try {
        return await apiFetch<User>('/api/auth/me');
      } catch {
        return null;
      }
    },
  });
}

export function persistAuthUserQuery(queryClient: QueryClient, apiFetch: ApiFetch): Promise<void> {
  return authQueryPersister.persistQueryByKey(authUserQueryOptions(apiFetch).queryKey, queryClient);
}

export function removePersistedAuthUserQuery(): Promise<void> {
  return authQueryPersister.removeQueries();
}
