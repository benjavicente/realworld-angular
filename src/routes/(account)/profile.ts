import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireAuth } from '../-guards';

export const Route = createFileRoute('/(account)/profile')({
  head: () => ({ meta: [{ title: 'My Profile' }] }),
  beforeLoad: ({ context, location }) => requireAuth(context, location),
});
