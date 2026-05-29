import { InjectionToken, computed, inject } from '@angular/core';
import { injectQuery, queryOptions } from '@benjavicente/angular-query';
import { injectRouter } from '@benjavicente/angular-router-experimental';
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

export interface AuthState {
  user: () => User | null;
  isAuthenticated: () => boolean;
  isCustomer: () => boolean;
  isAdmin: () => boolean;
}

export const AUTH_STATE = new InjectionToken<AuthState>('AuthState');

export function createAuthState(): AuthState {
  const { apiFetch } = injectRouter().options.context;
  const userQuery = injectQuery(() => authUserQueryOptions(apiFetch));

  const user = computed<User | null>(() => userQuery.data() ?? null);

  return {
    user,
    isAuthenticated: computed<boolean>(() => user() !== null),
    isCustomer: computed<boolean>(() => user()?.role === 'CUSTOMER'),
    isAdmin: computed<boolean>(() => user()?.role === 'PIZZERIA_ADMIN'),
  };
}

export function injectAuthState() {
  const testAuthState = inject(AUTH_STATE, { optional: true });
  if (testAuthState) {
    return testAuthState;
  }

  return createAuthState();
}
