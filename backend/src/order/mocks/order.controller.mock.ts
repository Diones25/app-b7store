
export const mockUserId = 1;
export const mockOrderId = 10;

export const mockOrder = {
  id: mockOrderId,
  status: 'paid',
  total: 100,
  createdAt: new Date(),
  shippingCity: 'Cidade',
  shippingStreet: 'Rua',
  shippingZipcode: '00000000',
  shippingState: 'SP',
  shippingCountry: 'Brasil',
  shippingNumber: '123',
  shippingComplement: '',
  shippingCost: 10,
  shippingDays: 5,
  orderItem: [
    {
      id: 1,
      quantity: 2,
      price: 50,
      product: {
        id: 5,
        label: 'Produto Teste',
        price: 50,
        image: 'media/products/image.png' // ← será transformado
      }
    }
  ]
};