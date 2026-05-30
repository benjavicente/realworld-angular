import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { ROLES } from '../(auth)/-models/role.model';
import { requireAuth } from '../-guards';
import { ordersQueryOptions } from '../../lib/api/api-queries';
import { authUserQueryOptions } from '../../lib/services/auth';

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
  loader: async ({ context, deps }) => {
    if (import.meta.env.SSR) {
      return;
    }

    const [orders, user] = await Promise.all([
      context.queryClient.ensureQueryData(ordersQueryOptions(context.apiFetch, deps.page, 10)),
      context.queryClient.ensureQueryData(authUserQueryOptions(context.apiFetch)),
    ]);

    return { orders, isPizzeriaAdmin: user?.role === ROLES.PIZZERIA_ADMIN };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.isPizzeriaAdmin ? 'Orders' : 'My Orders' }],
  }),
});
