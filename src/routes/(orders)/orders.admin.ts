import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { ROLES } from '../(auth)/-models/role.model';
import { requireRole } from '../-guards';
import { adminOrdersQueryOptions } from '../../lib/api/api-queries';

export const Route = createFileRoute('/(orders)/orders/admin')({
  head: () => ({ meta: [{ title: 'Orders - Admin' }] }),
  beforeLoad: ({ context, location }) => requireRole(context, ROLES.PIZZERIA_ADMIN, location),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminOrdersQueryOptions(context.apiFetch, 1, 15)),
});
