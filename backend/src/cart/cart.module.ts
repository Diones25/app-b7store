import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from 'src/products/products.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [ProductsModule, OrderModule],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}
