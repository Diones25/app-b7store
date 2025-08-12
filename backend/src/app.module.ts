import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from './banners/banners.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, BannersModule, ProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
