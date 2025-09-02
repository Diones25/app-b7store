import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [StripeService],
  exports: [StripeService]
})
export class StripeModule {}
