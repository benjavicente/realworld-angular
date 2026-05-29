import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { adminPizzasQueryOptions } from '../../lib/api/api-queries';

export const Route = createFileRoute('/(pizzerias)/pizzerias/admin/pizzas')({
  head: () => ({ meta: [{ title: 'Manage Pizzas' }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminPizzasQueryOptions(context.apiFetch)),
});
