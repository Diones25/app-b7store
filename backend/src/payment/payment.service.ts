import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateLinkParams } from '../types/create-link-params';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentService {

  constructor(private readonly stripeService: StripeService) { }
  
  private readonly logger = new Logger(PaymentService.name);

  async createPaymentLink({ cart, shippingCost, orderId }: CreateLinkParams): Promise<string | null> {
    try {
      const session = await this.stripeService.createStripeCheckoutSession({ cart, shippingCost, orderId });
      if (!session.url) return null;
      return session.url;
    } catch (error) {
      this.logger.error('Erro ao criar link de pagamento', error);
      throw new BadRequestException('Erro ao criar link de pagamento');
    }
  }
}
