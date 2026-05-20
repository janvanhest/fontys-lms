import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Student } from '../../student/student.entity';
import { StudentService } from '../../student/student.service';
import { MockAuthGuard } from './mock-auth.guard';

const mockStudentService = () => ({ findOrCreate: jest.fn() });
const mockReflector = () => ({ getAllAndOverride: jest.fn() });

function buildContext(isPublic: boolean, request: Record<string, unknown> = {}): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('MockAuthGuard', () => {
  let guard: MockAuthGuard;
  let studentService: ReturnType<typeof mockStudentService>;
  let reflector: ReturnType<typeof mockReflector>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockAuthGuard,
        { provide: StudentService, useFactory: mockStudentService },
        { provide: Reflector, useFactory: mockReflector },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(true) } },
      ],
    }).compile();

    guard = module.get(MockAuthGuard);
    studentService = module.get(StudentService);
    reflector = module.get(Reflector);
  });

  it('allows public routes without calling StudentService', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate(buildContext(true));

    expect(result).toBe(true);
    expect(studentService.findOrCreate).not.toHaveBeenCalled();
  });

  it('calls findOrCreate and sets request.user for protected routes', async () => {
    const student = { id: 'uuid-1', canvasUserId: '31474' } as Student;
    reflector.getAllAndOverride.mockReturnValue(false);
    studentService.findOrCreate.mockResolvedValue(student);
    const request: Record<string, unknown> = {};

    const result = await guard.canActivate(buildContext(false, request));

    expect(result).toBe(true);
    expect(studentService.findOrCreate).toHaveBeenCalledWith({
      canvasUserId: '31474',
      displayName: 'Hest, Jan J.H. van',
      email: 'jan.vanhest@student.fontys.nl',
      avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
    });
    expect(request.user).toBe(student);
  });

  it('rejects protected routes when MOCK_AUTH is disabled', async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockAuthGuard,
        { provide: StudentService, useFactory: mockStudentService },
        { provide: Reflector, useFactory: mockReflector },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(false) } },
      ],
    }).compile();

    guard = module.get(MockAuthGuard);
    reflector = module.get(Reflector);
    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(buildContext(false, {}))).rejects.toThrow(
      'Mock auth is disabled',
    );
  });
});
