import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './env.validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
/**
 * Serves as the root module that wires together the application's core components.
 * This module configures imported feature modules, controllers, and providers for the NestJS app.
 */
export class AppModule {}
