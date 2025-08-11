import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [PrismaModule, BannersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
