import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Student } from '../../student/student.entity';

export const CurrentStudent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Student => {
    return ctx.switchToHttp().getRequest().user as Student;
  },
);
