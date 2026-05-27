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

async function resolveUser(context: RouteContext) {
  return context.queryClient.ensureQueryData(authUserQueryOptions(context.apiFetch));
}

export async function requireAuth(context: RouteContext): Promise<void> {
  const user = await resolveUser(context);
  if (!user) {
    throw redirect({ to: '/auth/login' });
  }
}

export async function requireGuest(context: RouteContext): Promise<void> {
  const user = await resolveUser(context);
  if (user) {
    throw redirect({ to: '/' });
  }
}

export async function requireRole(context: RouteContext, role: string): Promise<void> {
  const user = await resolveUser(context);
  if (!user) {
    throw redirect({ to: '/auth/login' });
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

export async function requireNoPizzeria(context: RouteContext): Promise<void> {
  await requireRole(context, ROLES.PIZZERIA_ADMIN);

  try {
    await context.queryClient.ensureQueryData(adminPizzeriaQueryOptions(context.apiFetch));
    throw redirect({ to: '/pizzerias/admin' });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
  }
}
