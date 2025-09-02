import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { StripeCheckoutSessionParams } from '../types/stripe-checkout-session-params';
import { StripeLineItems } from 'src/types/stripe-line-items';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly apiSecretKeyStripe: string | undefined;
  private stripe: Stripe;

  constructor(
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {
    this.apiSecretKeyStripe = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(this.apiSecretKeyStripe as string);
  }
  
  private readonly logger = new Logger(StripeService.name);

  async createStripeCheckoutSession({ cart, shippingCost, orderId }: StripeCheckoutSessionParams) {
    let stripeLineItems: StripeLineItems[] = [];
  
    for (let cartItem of cart) {
      const product = await this.productsService.findOne(cartItem.productId);
      if (product) {
        stripeLineItems.push({
          price_data: {
            product_data: {
              name: product.label,
            },
            currency: 'BRL',
            unit_amount: Math.round(product.price * 100),
          },
          quantity: cartItem.quantity,
        });
      }
    }

    if (shippingCost > 0) {
      stripeLineItems.push({
        price_data: {
          product_data: {
            name: 'Frete',
          },
          currency: 'BRL',
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }


  }
}
