import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireAuth } from '../-guards';

export const Route = createFileRoute('/(orders)/orders/$id')({
  beforeLoad: ({ context, location }) => requireAuth(context, location),
  head: ({ params }) => ({
    meta: [{ title: `Order ${params.id}` }],
  }),
});
