import { createFileRoute } from '@benjavicente/angular-router-experimental';

export const Route = createFileRoute('/(legal)/unauthorized')({
  head: () => ({ meta: [{ title: 'Unauthorized' }] }),
});
