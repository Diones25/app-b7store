import { CartItem } from "./cart-item";

export type CreateLinkParams = {
  cart: CartItem[];
  shippingCost: number; 
  orderId: number;
}