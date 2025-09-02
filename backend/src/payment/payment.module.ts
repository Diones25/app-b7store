import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [StripeModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
