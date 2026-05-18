import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Student } from '../../student/student.entity';

export const CurrentStudent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Student => {
    const request = ctx.switchToHttp().getRequest<{ user: Student }>();
    return request.user;
  },
);
