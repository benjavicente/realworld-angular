import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireGuest, validateRedirectSearch } from '../-guards';

export const Route = createFileRoute('/(auth)/auth/register')({
  head: () => ({ meta: [{ title: 'Register' }] }),
  validateSearch: validateRedirectSearch,
  beforeLoad: ({ context, search }) => requireGuest(context, search.redirect),
});
