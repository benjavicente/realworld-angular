import { createFileRoute, redirect } from '@benjavicente/angular-router-experimental';

export const Route = createFileRoute('/(pizzerias)/pizzerias/admin/')({
  beforeLoad: () => {
    throw redirect({ to: '/pizzerias/admin/pizzas' });
  },
});
