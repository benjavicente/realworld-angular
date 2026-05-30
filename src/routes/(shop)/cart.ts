import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { cartHeadTitle, loadCartPreviewForHead } from './-store/cart-route';

export const Route = createFileRoute('/(shop)/cart')({
  loader: loadCartPreviewForHead,
  head: ({ loaderData }) => ({
    meta: [{ title: cartHeadTitle('Cart', loaderData) }],
  }),
});
