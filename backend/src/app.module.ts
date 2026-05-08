import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
/**
 * Serves as the root module that wires together the application's core components.
 * This module configures imported feature modules, controllers, and providers for the NestJS app.
 */
export class AppModule {}
