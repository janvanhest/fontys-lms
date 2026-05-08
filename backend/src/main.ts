import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

/**
 * Bootstraps and starts the NestJS application.
 * This function initializes the app, applies configuration, and begins listening for incoming requests.
 *
 * Args:
 *   None.
 *
 * Returns:
 *   A promise that resolves when the application has started listening.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  configureApp(app, configService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}
void bootstrap();
