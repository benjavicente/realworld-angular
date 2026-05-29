import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireAuth } from '../-guards';
import { ordersQueryOptions } from '../../lib/api/api-queries';

interface OrdersSearch {
  page?: number;
}

function validateOrdersSearch(search: Record<string, unknown>): OrdersSearch {
  const page = Number(search['page']);
  return Number.isInteger(page) && page > 1 ? { page } : {};
}

export const Route = createFileRoute('/(orders)/orders/')({
  validateSearch: validateOrdersSearch,
  beforeLoad: ({ context, location }) => requireAuth(context, location),
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
  }),
  loader: ({ context, deps }) => {
    if (import.meta.env.SSR) {
      return;
    }

    return context.queryClient.ensureQueryData(
      ordersQueryOptions(context.apiFetch, deps.page, 10),
    );
  },
});
