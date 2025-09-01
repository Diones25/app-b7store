import { Address } from "./address";
import { CartItem } from "./cart-item";

export type CreateOrderParams = {
  userId: number;
  address: Address;
  shippingCost: number;
  shippingDays: number;
  cart: CartItem[];
}