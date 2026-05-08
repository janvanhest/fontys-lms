import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
/**
 * Groups the health check controller and service into a dedicated module.
 * This module encapsulates health-related functionality for easier reuse and maintenance.
 */
export class HealthModule {}
