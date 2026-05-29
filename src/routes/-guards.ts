import { redirect } from '@benjavicente/angular-router-experimental';
import { authUserQueryOptions } from '../lib/services/auth';
import { ROLES } from './(auth)/-models/role.model';
import { adminPizzeriaQueryOptions } from '../lib/api/api-queries';
import type { ApiFetch } from '../lib/http/api-client';
import type { QueryClient } from '@benjavicente/angular-query-experimental';
import type { AngularInjectFn } from '@benjavicente/angular-router-experimental';
import type { CartClientStore } from './(shop)/-store/cart-client.store';

export interface RouteContext {
  queryClient: QueryClient;
  apiFetch: ApiFetch;
  cart: CartClientStore;
  inject: AngularInjectFn;
}

export interface RedirectSearch {
  redirect?: string;
}

interface RouteLocationLike {
  href?: string;
  pathname?: string;
  searchStr?: string;
}

export function validateRedirectSearch(search: Record<string, unknown>): RedirectSearch {
  return {
    redirect: sanitizeRedirectPath(
      typeof search['redirect'] === 'string' ? search['redirect'] : undefined,
    ),
  };
}

export function sanitizeRedirectPath(path: string | undefined, fallback = '/'): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return fallback;
  }
  return path;
}

function currentPath(location: RouteLocationLike | undefined): string {
  if (!location) {
    return '/';
  }
  if (location.href?.startsWith('/')) {
    return location.href;
  }
  return `${location.pathname ?? '/'}${location.searchStr ?? ''}`;
}

async function resolveUser(context: RouteContext) {
  return context.queryClient.ensureQueryData(authUserQueryOptions(context.apiFetch));
}

export async function requireAuth(
  context: RouteContext,
  location?: RouteLocationLike,
): Promise<void> {
  const user = await resolveUser(context);
  if (!user) {
    throw redirect({
      to: '/auth/login',
      search: { redirect: sanitizeRedirectPath(currentPath(location)) },
    });
  }
}

export async function requireGuest(
  context: RouteContext,
  redirectPath: string | undefined = '/',
): Promise<void> {
  const user = await resolveUser(context);
  if (user) {
    throw redirect({ href: sanitizeRedirectPath(redirectPath) });
  }
}

export async function requireRole(
  context: RouteContext,
  role: string,
  location?: RouteLocationLike,
): Promise<void> {
  const user = await resolveUser(context);
  if (!user) {
    throw redirect({
      to: '/auth/login',
      search: { redirect: sanitizeRedirectPath(currentPath(location)) },
    });
  }
  if (user.role !== role) {
    throw redirect({ to: '/unauthorized' });
  }
}

export function requireCart(context: RouteContext): void {
  if (context.cart.isEmpty()) {
    throw redirect({ to: '/cart' });
  }
}

export async function requireNoPizzeria(
  context: RouteContext,
  location?: RouteLocationLike,
): Promise<void> {
  await requireRole(context, ROLES.PIZZERIA_ADMIN, location);

  try {
    await context.queryClient.ensureQueryData(adminPizzeriaQueryOptions(context.apiFetch));
    throw redirect({ to: '/pizzerias/admin' });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
  }
}
