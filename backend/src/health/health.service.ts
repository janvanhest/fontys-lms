import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Injectable()
export class HealthService {
  // TODO: replace with @nestjs/terminus and add a DB health indicator once TypeORM/Prisma is wired up
  check(): HealthCheckResponseDto {
    return { status: 'ok' };
  }
}
