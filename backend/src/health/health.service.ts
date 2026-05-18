import { Injectable } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  async check(): Promise<HealthCheckResponseDto> {
    try {
      return await this.health.check([() => this.db.pingCheck('database')]);
    } catch (error: unknown) {
      if (this.isHealthCheckResponse(error)) {
        return error;
      }

      return {
        status: 'error',
        error: { message: error instanceof Error ? String(error) : String(error) },
        details: { message: error instanceof Error ? String(error) : String(error) },
      };
    }
  }

  private isHealthCheckResponse(error: unknown): error is HealthCheckResponseDto {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'string'
    );
  }
}
