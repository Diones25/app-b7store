import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('B7Store - API')
    .setDescription('O B7Store é uma api de ecomerce, com gerenciamento de banners, produtos, carrinho e integração com o Stripe para gerenciamento de pagamentos.')
    .setVersion('1.0')
    .addBearerAuth( 
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT para autenticar',
        in: 'header',
      },
      'JWT-auth', 
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory()); 

  await app.listen(process.env.PORT ?? 3000);
  Logger.log(`Servidor rodando em http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
