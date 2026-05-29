import { createFileRoute } from '@benjavicente/angular-router-experimental';

export const Route = createFileRoute('/(legal)/terms-and-conditions')({
  head: () => ({ meta: [{ title: 'Terms & Conditions' }] }),
});
