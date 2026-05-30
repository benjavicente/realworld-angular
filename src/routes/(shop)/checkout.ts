import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { requireAuth, requireCart } from '../-guards';
import { cartHeadTitle, loadCartPreviewForHead } from './-store/cart-route';

export const Route = createFileRoute('/(shop)/checkout')({
  beforeLoad: async ({ context, location }) => {
    await requireAuth(context, location);
    requireCart(context);
  },
  loader: loadCartPreviewForHead,
  head: ({ loaderData }) => ({
    meta: [{ title: cartHeadTitle('Checkout', loaderData) }],
  }),
});
