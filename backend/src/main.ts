import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Servidor rodando em http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
