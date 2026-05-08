import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Returns the current health status of the application from the underlying service.
   * This method allows clients to verify that the application is responsive and operational.
   *
   * @returns An object containing a status string that reflects the application's health.
   */
  @Get()
  check(): { status: string } {
    return this.healthService.check();
  }
}
