import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { ROLES } from '../(auth)/-models/role.model';
import { requireRole } from '../-guards';
import { adminPizzeriaQueryOptions } from '../../lib/api/api-queries';

export const Route = createFileRoute('/(pizzerias)/pizzerias/admin')({
  beforeLoad: ({ context, location }) => requireRole(context, ROLES.PIZZERIA_ADMIN, location),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminPizzeriaQueryOptions(context.apiFetch)),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.name ? `${loaderData.name} - Admin` : 'Admin' }],
  }),
});
