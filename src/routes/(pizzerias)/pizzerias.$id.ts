import { createFileRoute } from '@benjavicente/angular-router-experimental';
import {
  pizzaOptionsQueryOptions,
  pizzeriaPizzasQueryOptions,
  pizzeriaQueryOptions,
} from '../../lib/api/api-queries';

interface PizzeriaDetailSearch {
  maxPrice?: number;
}

function validatePizzeriaDetailSearch(search: Record<string, unknown>): PizzeriaDetailSearch {
  const maxPrice = Number(search['maxPrice']);
  return Number.isFinite(maxPrice) && maxPrice >= 0 && maxPrice <= 50 ? { maxPrice } : {};
}

export const Route = createFileRoute('/(pizzerias)/pizzerias/$id')({
  validateSearch: validatePizzeriaDetailSearch,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(pizzeriaQueryOptions(context.apiFetch, params.id)),
      context.queryClient.ensureQueryData(pizzeriaPizzasQueryOptions(context.apiFetch, params.id)),
      context.queryClient.ensureQueryData(pizzaOptionsQueryOptions(context.apiFetch, 'sizes')),
      context.queryClient.ensureQueryData(pizzaOptionsQueryOptions(context.apiFetch, 'toppings')),
    ]),
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.[0]?.name ? `${loaderData[0].name} - Pizzeria` : 'Pizzeria' }],
  }),
});
