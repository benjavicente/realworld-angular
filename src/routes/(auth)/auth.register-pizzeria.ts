import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireGuest, validateRedirectSearch } from '../-guards';

export const Route = createFileRoute('/(auth)/auth/register-pizzeria')({
  head: () => ({ meta: [{ title: 'Create your pizzeria account' }] }),
  validateSearch: validateRedirectSearch,
  beforeLoad: ({ context, search }) => requireGuest(context, search.redirect),
});
