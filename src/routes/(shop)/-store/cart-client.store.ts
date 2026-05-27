import { createAtom } from '@tanstack/store';
import type { CartClientState, CartItem } from './cart.types';

export type CartClientStore = ReturnType<typeof createCartClientStore>;

export function createCartClientStore() {
  const state = createAtom<CartClientState>({ pizzeria: null, items: [] });

  function generateItemId(
    pizzaId: string,
    selectedSizeId: string | null,
    selectedOptionIds: string[],
  ): string {
    const sizeId = selectedSizeId ?? '';
    const toppingIds = [...selectedOptionIds].sort().join(',');
    return `${pizzaId}:${sizeId}:${toppingIds}`;
  }

  return Object.assign(state, {
    isEmpty(): boolean {
      return state.get().items.length === 0;
    },

    hasItemsForOtherPizzeria(pizzeriaId: string): boolean {
      const current = state.get().pizzeria;
      return current !== null && current.id !== pizzeriaId;
    },

    addItem(
      pizzaId: string,
      quantity: number,
      selectedSizeId: string | null,
      selectedOptionIds: string[],
      pizzeriaId: string,
    ): void {
      if (this.hasItemsForOtherPizzeria(pizzeriaId)) {
        this.clear();
      }

      const itemId = generateItemId(pizzaId, selectedSizeId, selectedOptionIds);
      const current = state.get();

      const existing = current.items.find((item) => item.id === itemId);
      const items = existing
        ? current.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [
            ...current.items,
            {
              id: itemId,
              pizzaId,
              quantity,
              selectedSizeId,
              selectedOptionIds,
            } satisfies CartItem,
          ];

      state.set({ pizzeria: { id: pizzeriaId }, items });
    },

    updateQuantity(itemId: string, quantity: number): void {
      if (quantity === 0) {
        this.removeItem(itemId);
        return;
      }

      const current = state.get();
      state.set({
        ...current,
        items: current.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      });
    },

    removeItem(itemId: string): void {
      const current = state.get();
      const items = current.items.filter((item) => item.id !== itemId);
      if (items.length === 0) {
        state.set({ pizzeria: null, items: [] });
        return;
      }
      state.set({ ...current, items });
    },

    clear(): void {
      state.set({ pizzeria: null, items: [] });
    },
  });
}
