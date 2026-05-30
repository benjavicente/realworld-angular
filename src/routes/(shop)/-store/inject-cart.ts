import { DestroyRef, computed, inject, signal } from '@angular/core';
import { injectRouter } from '@benjavicente/angular-router-experimental';
import type { CartClientStore } from './cart-client.store';
import type { CartClientState } from './cart.types';

export function injectCartClient(): CartClientStore {
  const cart = injectRouter().options.context.cart;
  if (!cart) {
    throw new Error('Cart store is missing from router context');
  }
  return cart;
}

function injectCartClientStateSignal() {
  const cart = injectCartClient();
  const state = signal<CartClientState>(cart.get());
  const destroyRef = inject(DestroyRef);

  const subscription = cart.subscribe((next) => {
    state.set(next);
  });

  destroyRef.onDestroy(() => {
    subscription.unsubscribe();
  });

  return state;
}

export function injectCartClientState() {
  const state = injectCartClientStateSignal();

  return {
    pizzeria: computed(() => state().pizzeria),
    items: computed(() => state().items),
    isEmpty: computed(() => state().items.length === 0),
  };
}

/** Immediate item count from client cart (works for guests without waiting on preview API). */
export function injectCartClientItemCount() {
  const items = injectCartClientState().items;
  return computed(() => items().reduce((sum, item) => sum + item.quantity, 0));
}
