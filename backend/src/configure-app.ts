import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const globalValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};

const defaultCorsOrigins = ['http://localhost:5173'];

function getCorsOptions() {
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return {
    origin:
      configuredOrigins && configuredOrigins.length > 0 ? configuredOrigins : defaultCorsOrigins,
  };
}

/**
 * Configures the NestJS application with global validation and API documentation.
 * This function prepares the app for runtime by enabling validation behavior and Swagger UI.
 *
 * Args:
 *   app: The NestJS application instance to configure.
 *
 * Returns:
 *   This function does not return a value.
 */
export function configureApp(app: INestApplication): void {
  app.enableCors(getCorsOptions());
  app.useGlobalPipes(new ValidationPipe(globalValidationPipeOptions));

  const config = new DocumentBuilder()
    .setTitle('Fontys LMS Backend')
    .setDescription('NestJS backend voor de chatbot en API')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
