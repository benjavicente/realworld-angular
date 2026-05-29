import { createFileRoute } from '@benjavicente/angular-router-experimental';
import { pizzeriasQueryOptions } from '../../lib/api/api-queries';
import { PizzeriasRoutePending } from '../-components/route-pending/pizzerias-route-pending';

interface PizzeriaListSearch {
  page?: number;
  search?: string;
}

const PIZZERIAS_LIMIT = 12;

function pageSearchValue(value: unknown): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function validatePizzeriaListSearch(search: Record<string, unknown>): PizzeriaListSearch {
  const page = pageSearchValue(search['page']);
  const searchText = typeof search['search'] === 'string' ? search['search'].trim() : '';

  return {
    ...(page > 1 ? { page } : {}),
    ...(searchText ? { search: searchText } : {}),
  };
}

export const Route = createFileRoute('/(pizzerias)/pizzerias/')({
  head: () => ({ meta: [{ title: 'Pizzerias' }] }),
  pendingComponent: () => PizzeriasRoutePending,
  validateSearch: validatePizzeriaListSearch,
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    search: search.search,
  }),
  loader: ({ context, deps }) => {
    if (import.meta.env.SSR) {
      return;
    }

    return context.queryClient.ensureQueryData(
      pizzeriasQueryOptions(context.apiFetch, {
        page: deps.page,
        limit: PIZZERIAS_LIMIT,
        ...(deps.search ? { search: deps.search } : {}),
      }),
    );
  },
});
