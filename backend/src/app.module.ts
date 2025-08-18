import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from './banners/banners.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [PrismaModule, BannersModule, ProductsModule, CategoryModule, CartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
