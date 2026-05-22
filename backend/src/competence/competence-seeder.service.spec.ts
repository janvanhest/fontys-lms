import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentService } from '../student/student.service';
import { Student } from '../student/student.entity';
import { CompetenceProgress } from './competence-progress.entity';
import { CompetenceSeederService } from './competence-seeder.service';

const MOCK_STUDENT_ENTITY = { id: 'mock-student-uuid' } as Student;

describe('CompetenceSeederService', () => {
  let seeder: CompetenceSeederService;
  let configService: { get: jest.Mock };
  let studentService: { findOrCreate: jest.Mock };
  let repo: jest.Mocked<Pick<Repository<CompetenceProgress>, 'count' | 'create' | 'save'>>;

  beforeEach(async () => {
    configService = { get: jest.fn() };
    studentService = { findOrCreate: jest.fn().mockResolvedValue(MOCK_STUDENT_ENTITY) };
    repo = { count: jest.fn(), create: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetenceSeederService,
        { provide: ConfigService, useValue: configService },
        { provide: StudentService, useValue: studentService },
        { provide: getRepositoryToken(CompetenceProgress), useValue: repo },
      ],
    }).compile();

    seeder = module.get<CompetenceSeederService>(CompetenceSeederService);
  });

  it('does nothing when mock auth is disabled', async () => {
    configService.get.mockReturnValue(false);

    await seeder.onApplicationBootstrap();

    expect(studentService.findOrCreate).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('seeds competence progress for the mock student when the table is empty', async () => {
    configService.get.mockReturnValue(true);
    repo.count.mockResolvedValue(0);
    repo.create.mockImplementation((data) => data as CompetenceProgress);
    repo.save.mockResolvedValue([] as unknown as CompetenceProgress);

    await seeder.onApplicationBootstrap();

    expect(repo.save).toHaveBeenCalledTimes(1);
    const savedRows = repo.save.mock.calls[0][0] as CompetenceProgress[];
    expect(savedRows).toHaveLength(12);
    expect(savedRows.every((row) => row.studentId === 'mock-student-uuid')).toBe(true);
  });

  it('skips seeding when the mock student already has progress', async () => {
    configService.get.mockReturnValue(true);
    repo.count.mockResolvedValue(12);

    await seeder.onApplicationBootstrap();

    expect(repo.save).not.toHaveBeenCalled();
  });
});
