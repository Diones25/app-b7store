import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
