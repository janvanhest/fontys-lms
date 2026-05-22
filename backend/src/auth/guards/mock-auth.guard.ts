import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { StudentService } from '../../student/student.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export const MOCK_STUDENT = {
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
};

@Injectable()
export class MockAuthGuard implements CanActivate {
  private readonly logger = new Logger(MockAuthGuard.name);
  private readonly enabled: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly studentService: StudentService,
    private readonly configService: ConfigService,
  ) {
    this.enabled = this.configService.get<boolean>('MOCK_AUTH', false);

    if (this.enabled) {
      this.logger.warn(
        'Mock auth is enabled. Protected routes will use the hard-coded demo student.',
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    if (!this.enabled) {
      throw new UnauthorizedException('Mock auth is disabled');
    }

    const request = context.switchToHttp().getRequest<{ user: unknown }>();
    request.user = await this.studentService.findOrCreate(MOCK_STUDENT);
    return true;
  }
}
