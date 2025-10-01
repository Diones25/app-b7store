import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/order.service';

@Injectable()
export class WebhookService {
  private readonly apiSecretKeyStripe: string | undefined;
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderService: OrderService
  ) {
    this.apiSecretKeyStripe = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(this.apiSecretKeyStripe as string);    
  }

  private readonly logger = new Logger(WebhookService.name);

  async stripeWebhook(rawBody: string, signature: string, webhookSecret: string) {
    const event = await this.constuctEvent(rawBody, signature, webhookSecret);
    if (event) {
      const session = event.data.object as any;
      const orderId = parseInt(session.metadata?.orderId);

      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
          await this.orderService.updateOrderStatus(orderId, 'paid');
          break;
        case 'checkout.session.expired':
        case 'checkout.session.async_payment_failed':
          await this.orderService.updateOrderStatus(orderId, 'cancelled');
          break;
      }
    }
  }
  
  async constuctEvent(rawBody: any, signature: string, webhookSecret: string) {
    try {
      this.logger.log('Criando evento');
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Erro ao criar evento');
      throw new BadRequestException('Erro ao criar evento');
    }
  }
}
