import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  async check(): Promise<HealthCheckResponseDto> {
    try {
      await this.health.check([() => this.db.pingCheck('database')]);
      return { status: 'ok' };
    } catch (error) {
      if (error instanceof HealthCheckError) {
        return { status: 'error', details: error.causes as Record<string, unknown> };
      }
      return { status: 'error', details: { message: String(error) } };
    }
  }
}
