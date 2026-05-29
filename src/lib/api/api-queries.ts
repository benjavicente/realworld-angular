import { queryOptions } from '@benjavicente/angular-query-experimental';
import { experimental_streamedQuery as streamedQuery } from '@tanstack/query-core';
import type { ApiFetch } from '../http/api-client';
import type { Page } from '../models/pagination.model';
import type { CartData, CartItem, CartPizzeria } from '../../routes/(shop)/-store/cart.types';
import type { Order, AdminOrderListItem } from '../../routes/(orders)/-models/order.models';
import type { Pizza, PizzaOption } from '../../routes/(pizzerias)/-models/pizza.models';
import type {
  PizzeriaDetail,
  PizzeriaSummary,
} from '../../routes/(pizzerias)/-models/pizzeria.models';
import { environment } from '../../environments/environment';

export function pizzeriasQueryOptions(
  apiFetch: ApiFetch,
  params: { page: number; limit: number; search?: string },
) {
  return queryOptions({
    queryKey: ['pizzerias', params],
    queryFn: () => apiFetch<Page<PizzeriaSummary>>('/api/pizzerias', { query: params }),
  });
}

export function pizzeriaQueryOptions(apiFetch: ApiFetch, id: string) {
  return queryOptions({
    queryKey: ['pizzerias', 'detail', id],
    queryFn: () => apiFetch<PizzeriaDetail>(`/api/pizzerias/${id}`),
  });
}

export function pizzeriaPizzasQueryOptions(apiFetch: ApiFetch, id: string, name?: string) {
  return queryOptions({
    queryKey: ['pizzerias', id, 'pizzas', { name }],
    queryFn: () =>
      apiFetch<Pizza[]>(`/api/pizzerias/${id}/pizzas`, {
        query: name ? { name } : undefined,
      }),
  });
}

export function adminPizzeriaQueryOptions(apiFetch: ApiFetch) {
  return queryOptions({
    queryKey: ['admin', 'pizzeria'],
    queryFn: () => apiFetch<PizzeriaDetail>('/api/pizzerias/admin/pizzeria'),
  });
}

export function adminPizzasQueryOptions(apiFetch: ApiFetch) {
  return queryOptions({
    queryKey: ['admin', 'pizzas'],
    queryFn: () => apiFetch<Pizza[]>('/api/admin/pizzeria/pizzas'),
  });
}

export function ordersQueryOptions(apiFetch: ApiFetch, page: number, limit: number) {
  return queryOptions({
    queryKey: ['orders', { page, limit }],
    queryFn: () => apiFetch<Page<Order>>('/api/orders', { query: { page, limit } }),
  });
}

export function orderSubscriptionQueryOptions(_apiFetch: ApiFetch, id: string) {
  return queryOptions({
    queryKey: ['orders', 'detail', id],
    enabled: typeof EventSource !== 'undefined',
    queryFn: streamedQuery<Order, Order | null>({
      streamFn: ({ signal }) => Promise.resolve(orderSubscriptionStream(id, signal)),
      initialValue: null,
      reducer: (_order, update) => update,
    }),
  });
}

export function adminOrdersQueryOptions(apiFetch: ApiFetch, page: number, limit: number) {
  return queryOptions({
    queryKey: ['admin', 'orders', { page, limit }],
    queryFn: () => apiFetch<Page<AdminOrderListItem>>('/api/orders', { query: { page, limit } }),
  });
}

function orderSubscriptionStream(id: string, signal: AbortSignal): AsyncIterable<Order> {
  return {
    [Symbol.asyncIterator]() {
      let isDone = false;
      const queue: Order[] = [];
      let pending: {
        resolve: (result: IteratorResult<Order>) => void;
        reject: (reason: unknown) => void;
      } | null = null;

      const eventSource = new EventSource(`${environment.apiBaseUrl}/api/orders/${id}/subscribe`, {
        withCredentials: true,
      });

      const close = (): void => {
        if (isDone) {
          return;
        }
        isDone = true;
        signal.removeEventListener('abort', close);
        eventSource.close();
        pending?.resolve({ done: true, value: undefined });
        pending = null;
      };

      const fail = (error: Error): void => {
        if (isDone) {
          return;
        }
        isDone = true;
        signal.removeEventListener('abort', close);
        eventSource.close();
        pending?.reject(error);
        pending = null;
      };

      eventSource.onmessage = (event: MessageEvent<string>): void => {
        try {
          const order = JSON.parse(event.data) as Order;
          if (pending) {
            pending.resolve({ done: false, value: order });
            pending = null;
          } else {
            queue.push(order);
          }
        } catch {
          fail(new Error('Malformed payload'));
        }
      };

      eventSource.onerror = (): void => {
        fail(new Error('SSE connection error'));
      };

      signal.addEventListener('abort', close, { once: true });

      return {
        next: (): Promise<IteratorResult<Order>> => {
          if (queue.length > 0) {
            return Promise.resolve({ done: false, value: queue.shift()! });
          }
          if (isDone) {
            return Promise.resolve({ done: true, value: undefined });
          }
          return new Promise<IteratorResult<Order>>((resolve, reject) => {
            pending = { resolve, reject };
          });
        },
        return: (): Promise<IteratorResult<Order>> => {
          close();
          return Promise.resolve({ done: true, value: undefined });
        },
      };
    },
  };
}

export function pizzaOptionsQueryOptions(apiFetch: ApiFetch, kind: 'sizes' | 'toppings') {
  return queryOptions({
    queryKey: ['pizza-options', kind],
    queryFn: () => apiFetch<PizzaOption[]>(`/api/options/${kind}`),
  });
}

export function catalogImagesQueryOptions(apiFetch: ApiFetch, category: string) {
  return queryOptions({
    queryKey: ['catalog-images', category],
    queryFn: () =>
      apiFetch<string[]>(category === 'pizzeria' ? '/api/pizzerias/images' : '/api/pizzas/images'),
  });
}

export function cartPreviewQueryOptions(
  apiFetch: ApiFetch,
  pizzeria: CartPizzeria | null,
  items: CartItem[],
) {
  return queryOptions({
    queryKey: ['cart-preview', pizzeria?.id, items],
    enabled: Boolean(pizzeria && items.length > 0),
    placeholderData: (previousData) => previousData,
    queryFn: () =>
      apiFetch<CartData>('/api/orders/cart', {
        method: 'POST',
        body: {
          pizzeriaId: pizzeria!.id,
          items: items.map((item) => ({
            pizzaId: item.pizzaId,
            quantity: item.quantity,
            selectedSizeId: item.selectedSizeId ?? undefined,
            selectedOptionIds: item.selectedOptionIds,
          })),
        },
      }),
  });
}
