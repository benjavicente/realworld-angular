import { mutationOptions } from '@benjavicente/angular-query-experimental';
import type { ApiFetch } from '../http/api-client';
import { authUserQueryOptions } from '../services/auth';
import type { User } from '../models/user.model';
import type { Address } from '../models/address.model';
import type { Order } from '../../routes/(orders)/-models/order.models';
import type { PizzeriaDetail } from '../../routes/(pizzerias)/-models/pizzeria.models';
import type { Pizza } from '../../routes/(pizzerias)/-models/pizza.models';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface CreateOrderInput {
  pizzeriaId: string;
  deliveryAddress: Address;
  billingAddress?: Address;
  notes?: string;
  items: {
    pizzaId: string;
    quantity: number;
    selectedSizeId?: string;
    selectedOptionIds: string[];
  }[];
}

export interface PizzeriaInput {
  city: string;
  country: string;
  imageFilename: string;
}

export interface PizzaInput {
  basePrice: number;
  imageFilename: string;
  toppingIds: string[];
}

export const loginMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['auth', 'login'],
    mutationFn: (body: AuthCredentials) =>
      apiFetch<User>('/api/auth/login', { method: 'POST', body }),
    onSuccess: (user, _vars, _result, { client }) => {
      client.setQueryData(authUserQueryOptions(apiFetch).queryKey, user);
    },
  });

export const registerMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['auth', 'register'],
    mutationFn: (body: AuthCredentials) =>
      apiFetch<User>('/api/auth/register', { method: 'POST', body }),
    onSuccess: (user, _vars, _result, { client }) => {
      client.setQueryData(authUserQueryOptions(apiFetch).queryKey, user);
    },
  });

export const registerPizzeriaOwnerMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['auth', 'register-pizzeria-owner'],
    mutationFn: (body: AuthCredentials) =>
      apiFetch<User>('/api/auth/register-pizzeria-owner', { method: 'POST', body }),
    onSuccess: (user, _vars, _result, { client }) => {
      client.setQueryData(authUserQueryOptions(apiFetch).queryKey, user);
    },
  });

export const logoutMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['auth', 'logout'],
    mutationFn: () => apiFetch<void>('/api/auth/logout', { method: 'POST', body: {} }),
    onSuccess: (_void, _vars, _result, { client }) => {
      client.setQueryData(authUserQueryOptions(apiFetch).queryKey, null);
    },
  });

export const createOrderMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['orders', 'create'],
    mutationFn: (body: CreateOrderInput) =>
      apiFetch<Order>('/api/orders', { method: 'POST', body }),
  });

export const cancelOrderMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['orders', 'cancel'],
    mutationFn: (id: string) =>
      apiFetch<Order>(`/api/orders/${id}/cancel`, { method: 'PATCH', body: {} }),
  });

export const deliverOrderMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['orders', 'deliver'],
    mutationFn: (id: string) =>
      apiFetch<Order>(`/api/orders/${id}/delivered`, { method: 'PATCH', body: {} }),
  });

export const createPizzeriaMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['pizzerias', 'admin', 'create'],
    mutationFn: (body: PizzeriaInput) =>
      apiFetch<PizzeriaDetail>('/api/pizzerias', { method: 'POST', body }),
  });

export const updateMyPizzeriaMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['pizzerias', 'admin', 'update'],
    mutationFn: (body: PizzeriaInput) =>
      apiFetch<PizzeriaDetail>('/api/pizzerias/admin/pizzeria', { method: 'PATCH', body }),
  });

export const deleteMyPizzeriaMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['pizzerias', 'admin', 'delete'],
    mutationFn: () =>
      apiFetch<{ message: string }>('/api/pizzerias/admin/pizzeria', { method: 'DELETE' }),
  });

export const createPizzaMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['pizzerias', 'admin', 'pizzas', 'create'],
    mutationFn: (body: PizzaInput) =>
      apiFetch<Pizza>('/api/admin/pizzeria/pizzas', { method: 'POST', body }),
  });

export const updatePizzaMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['pizzerias', 'admin', 'pizzas', 'update'],
    mutationFn: ({ id, body }: { id: string; body: PizzaInput }) =>
      apiFetch<Pizza>(`/api/admin/pizzeria/pizzas/${id}`, { method: 'PATCH', body }),
  });

export const deletePizzaMutationOptions = (apiFetch: ApiFetch) =>
  mutationOptions({
    mutationKey: ['pizzerias', 'admin', 'pizzas', 'delete'],
    mutationFn: (id: string) =>
      apiFetch<{ message: string }>(`/api/admin/pizzeria/pizzas/${id}`, { method: 'DELETE' }),
  });
