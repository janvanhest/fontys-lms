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
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
