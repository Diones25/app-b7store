import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from './banners/banners.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [PrismaModule, BannersModule, ProductsModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
