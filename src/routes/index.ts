import { createFileRoute, redirect } from '@benjavicente/angular-router-experimental';
import { PizzeriasRoutePending } from './-components/route-pending/pizzerias-route-pending';

export const Route = createFileRoute('/')({
  ssr: false,
  pendingComponent: () => PizzeriasRoutePending,
  beforeLoad: () => {
    throw redirect({ to: '/pizzerias' });
  },
});
