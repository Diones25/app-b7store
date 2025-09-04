import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ProductsModule } from '../products/products.module';
import { OrderController } from './order.controller';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [ProductsModule, PaymentModule],
  providers: [OrderService],
  exports: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
