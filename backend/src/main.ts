import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //Converte tipos automaticamente
    transform: true, //Remove campos que não estão no DTO
    forbidNonWhitelisted: true // Erro se vier campo desconhecido
  }));
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Servidor rodando em http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
