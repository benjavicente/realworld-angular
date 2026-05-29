import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { adminPizzeriaQueryOptions } from '../../lib/api/api-queries';

export const Route = createFileRoute('/(pizzerias)/pizzerias/admin/configuration')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminPizzeriaQueryOptions(context.apiFetch)),
});
