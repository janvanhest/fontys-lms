import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentService } from './student.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('StudentService', () => {
  let service: StudentService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: getRepositoryToken(Student), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(StudentService);
    repo = module.get(getRepositoryToken(Student));
  });

  const dto = {
    canvasUserId: '31474',
    displayName: 'Hest, Jan J.H. van',
    email: 'jan.vanhest@student.fontys.nl',
    avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  };

  it('returns existing student without saving', async () => {
    const existing = { id: 'uuid-1', ...dto, createdAt: new Date() } as Student;
    repo.findOne.mockResolvedValue(existing);

    const result = await service.findOrCreate(dto);

    expect(result).toBe(existing);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('creates and saves new student when not found', async () => {
    const created = { id: 'uuid-2', ...dto, createdAt: new Date() } as Student;
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await service.findOrCreate(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });
});
