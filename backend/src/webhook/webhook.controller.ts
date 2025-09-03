import { Controller, Headers, Post, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request } from 'express';
import { getStripeWebhookSecret } from '../utils/get-stripe-webhook-secret';

@Controller('webhook')
export class WebhookController {

  constructor(
    private readonly webhookService: WebhookService
  ) {}

  @Post('stripe')
  async handleWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string,) {
    const webhookSecret = getStripeWebhookSecret();
    const rawBody = req.body;
    return this.webhookService.stripeWebhook(rawBody, signature, webhookSecret);
  }
}
