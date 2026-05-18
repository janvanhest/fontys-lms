import { Test } from '@nestjs/testing';
import { Student } from './student.entity';
import { StudentController } from './student.controller';

describe('StudentController', () => {
  let controller: StudentController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [StudentController],
    }).compile();
    controller = module.get(StudentController);
  });

  it('GET /student/me returns the student from request.user', () => {
    const student = {
      id: 'uuid-1',
      canvasUserId: '31474',
      displayName: 'Hest, Jan J.H. van',
      email: 'jan.vanhest@student.fontys.nl',
      avatarUrl: null,
      createdAt: new Date(),
    } as Student;

    expect(controller.me(student)).toBe(student);
  });
});
