import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('End-to-end PoC - hybride RAG + function calling')
    .setDescription('Tijn Knapen, sprint 3. Bewijst dat een chatbot HBO-i kennis (RAG, pgvector) en student-data (function calling, relationele DB) kan combineren in één antwoord.')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  Logger.log(`Backend draait op http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger UI op http://localhost:${port}/api/docs`, 'Bootstrap');
  Logger.log(`Chat UI op http://localhost:${port}/`, 'Bootstrap');
}
bootstrap();
