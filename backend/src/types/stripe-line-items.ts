export type StripeLineItems = {
  price_data: {
    product_data: {
      name: string;
    };
    currency: string;
    unit_amount: number;
  };
  quantity: number;
};