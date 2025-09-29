import { cartFinishDto } from "./cartfinish.mock";

const userId = 1;

const mockAddress = {
  street: 'Rua A',
  number: '123'
};

export const userAddressMock = {
  userId,
  address: mockAddress,
  shippingCost: 7,
  shippingDays: 3,
  cart: cartFinishDto.cart,
}