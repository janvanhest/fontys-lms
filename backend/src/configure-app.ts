import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const globalValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};

export function configureApp(app: INestApplication, configService: ConfigService): void {
  app.enableCors({
    origin: configService.getOrThrow<string[]>('CORS_ORIGINS'),
  });
  app.useGlobalPipes(new ValidationPipe(globalValidationPipeOptions));

  const config = new DocumentBuilder()
    .setTitle('Fontys LMS Backend')
    .setDescription('NestJS backend voor de chatbot en API')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
