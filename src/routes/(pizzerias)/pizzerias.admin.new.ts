import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireNoPizzeria } from '../-guards';

export const Route = createFileRoute('/(pizzerias)/pizzerias/admin/new')({
  head: () => ({ meta: [{ title: 'Create Pizzeria' }] }),
  beforeLoad: ({ context, location }) => requireNoPizzeria(context, location),
});
