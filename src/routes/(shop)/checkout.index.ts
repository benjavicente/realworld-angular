import { createFileRoute, redirect } from '@benjavicente/angular-router-experimental';

export const Route = createFileRoute('/(shop)/checkout/')({
  beforeLoad: () => {
    throw redirect({ to: '/checkout/delivery' });
  },
});
