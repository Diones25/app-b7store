import { CartItem } from "./cart-item";

export type StripeCheckoutSessionParams = {
  cart: CartItem[];
  shippingCost: number; 
  orderId: number;
}