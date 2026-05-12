import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const globalValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};

function getCorsOrigins(configService: ConfigService): string[] {
  const rawOrigins = configService.getOrThrow<string>('CORS_ORIGINS').trim();
  const configuredOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (configuredOrigins.length === 0) {
    throw new Error(
      'Invalid CORS_ORIGINS configuration: no valid origins found. Ensure CORS_ORIGINS is a comma-separated list of non-empty origins.',
    );
  }

  return configuredOrigins;
}

export function configureApp(app: INestApplication, configService: ConfigService): void {
  app.enableCors({
    origin: getCorsOrigins(configService),
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
