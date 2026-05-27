export interface CartPizzeria {
  id: string;
}

export interface CartItem {
  id: string;
  pizzaId: string;
  quantity: number;
  selectedSizeId: string | null;
  selectedOptionIds: string[];
}

export interface CartPizza {
  id: string;
  name: string;
  image: string;
  basePrice: number;
}

export interface CartOption {
  id: string;
  label: string;
  price: number;
}

export interface CartItemDetail {
  id: string;
  pizza: CartPizza;
  quantity: number;
  size: CartOption | null;
  extraToppings: CartOption[];
  totalPrice: number;
}

export interface CartData {
  pizzeria: { id: string; name: string; image: string };
  items: CartItemDetail[];
  total: number;
}

export interface CartClientState {
  pizzeria: CartPizzeria | null;
  items: CartItem[];
}
