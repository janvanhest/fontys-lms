import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StudentModule } from '../student/student.module';
import { MockAuthGuard } from './guards/mock-auth.guard';

@Module({
  imports: [StudentModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: MockAuthGuard,
    },
  ],
})
export class AuthModule {}
