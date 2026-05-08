import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  // TODO: replace with @nestjs/terminus and add a DB health indicator once TypeORM/Prisma is wired up
  check(): { status: string } {
    return { status: 'ok' };
  }
}
