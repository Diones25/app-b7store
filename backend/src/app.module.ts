import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from './banners/banners.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    BannersModule,
    ProductsModule,
    CategoryModule,
    CartModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
