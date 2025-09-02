import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [ProductsModule, OrderModule, PaymentModule],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
