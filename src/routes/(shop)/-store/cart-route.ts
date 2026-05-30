import { cartPreviewQueryOptions } from '../../../lib/api/api-queries';
import type { RouteContext } from '../../-guards';
import type { CartData } from './cart.types';

export function loadCartPreviewForHead({ context }: { context: RouteContext }) {
  if (import.meta.env.SSR) {
    return null;
  }

  const { pizzeria, items } = context.cart.get();
  if (!pizzeria || items.length === 0) {
    return null;
  }

  return context.queryClient.ensureQueryData(
    cartPreviewQueryOptions(context.apiFetch, pizzeria, items),
  );
}

export function cartHeadTitle(prefix: string, loaderData: CartData | null | undefined): string {
  const name = loaderData?.pizzeria.name;
  return name ? `${prefix} - ${name}` : prefix;
}
