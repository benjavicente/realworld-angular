import { queryOptions } from '@benjavicente/angular-query';
import type { ApiFetch } from '../http/api-client';
import type { User } from '../models/user.model';

export function authUserQueryOptions(apiFetch: ApiFetch) {
  return queryOptions({
    retry: false,
    staleTime: Infinity,
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
