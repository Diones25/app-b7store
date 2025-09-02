import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
