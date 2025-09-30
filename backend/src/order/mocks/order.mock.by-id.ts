export const mockOrderId = 1;

export const mockOrderById = {
  id: mockOrderId,
  status: 'paid',
  total: 100,
  shippingCost: 10,
  shippingDays: 3,
  shippingCity: 'São Paulo',
  shippingComplement: 'Apto 101',
  shippingCountry: 'Brasil',
  shippingNumber: '123',
  shippingState: 'SP',
  shippingStreet: 'Rua das Flores',
  shippingZipcode: '12345678',
  createdAt: new Date(),
  orderItem: [
    {
      id: 1,
      quantity: 2,
      price: 50,
      product: {
        id: 1,
        label: 'Produto 1',
        price: 50,
        images: [
          {
            url: 'image1.jpg'
          }
        ]
      }
    }
  ]
};