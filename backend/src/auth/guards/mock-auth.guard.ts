import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StudentService } from '../../student/student.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const MOCK_STUDENT = {
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
};

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly studentService: StudentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ user: unknown }>();
    request.user = await this.studentService.findOrCreate(MOCK_STUDENT);
    return true;
  }
}
