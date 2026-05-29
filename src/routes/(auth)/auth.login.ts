import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireGuest, validateRedirectSearch } from '../-guards';

export const Route = createFileRoute('/(auth)/auth/login')({
  head: () => ({ meta: [{ title: 'Login' }] }),
  validateSearch: validateRedirectSearch,
  beforeLoad: ({ context, search }) => requireGuest(context, search.redirect),
});
