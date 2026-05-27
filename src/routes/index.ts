import { createFileRoute, redirect } from '@benjavicente/angular-router-experimental';
import { authUserQueryOptions } from '../lib/services/auth';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authUserQueryOptions(context.apiFetch));
    throw redirect({ to: user?.role === 'PIZZERIA_ADMIN' ? '/pizzerias/admin' : '/pizzerias' });
  },
});
