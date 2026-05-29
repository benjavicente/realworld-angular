import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireAuth, requireCart } from '../-guards';

export const Route = createFileRoute('/(shop)/checkout')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth(context, location);
    requireCart(context);
  },
});
