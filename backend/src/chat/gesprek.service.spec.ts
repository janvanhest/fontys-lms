import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BerichtEntity } from './bericht.entity';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';

describe('GesprekService', () => {
  let service: GesprekService;
  let gesprekRepo: jest.Mocked<Pick<Repository<GesprekEntity>, 'save' | 'find' | 'findOne'>>;
  let berichtRepo: jest.Mocked<Pick<Repository<BerichtEntity>, 'save'>>;

  beforeEach(async () => {
    gesprekRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    berichtRepo = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GesprekService,
        { provide: getRepositoryToken(GesprekEntity), useValue: gesprekRepo },
        { provide: getRepositoryToken(BerichtEntity), useValue: berichtRepo },
      ],
    }).compile();

    service = module.get<GesprekService>(GesprekService);
  });

  it('maakNieuwGesprek slaat een gesprek op met studentId', async () => {
    const saved = { id: 'uuid-1', studentId: 'student-uuid', berichten: [] } as GesprekEntity;
    gesprekRepo.save.mockResolvedValue(saved);

    const result = await service.maakNieuwGesprek('student-uuid');

    expect(gesprekRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-uuid' }),
    );
    expect(result.id).toBe('uuid-1');
  });

  it('vindGesprekkenVanStudent geeft gesprekken gesorteerd op datum terug', async () => {
    const gesprekken = [
      { id: 'g1', studentId: 's1', aangemaaktOp: new Date('2026-05-17') },
      { id: 'g2', studentId: 's1', aangemaaktOp: new Date('2026-05-18') },
    ] as GesprekEntity[];
    gesprekRepo.find.mockResolvedValue(gesprekken);

    const result = await service.vindGesprekkenVanStudent('s1');

    expect(gesprekRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: 's1' } }),
    );
    expect(result).toHaveLength(2);
  });

  it('vindGesprekMetBerichten geeft null terug als gesprek niet bestaat', async () => {
    gesprekRepo.findOne.mockResolvedValue(null);

    const result = await service.vindGesprekMetBerichten('nonexistent');

    expect(result).toBeNull();
  });

  it('voegBerichtToe slaat een bericht op aan het gesprek', async () => {
    const bericht = {
      id: 'b1',
      gesprekId: 'g1',
      rol: 'student',
      inhoud: 'Hallo',
    } as BerichtEntity;
    berichtRepo.save.mockResolvedValue(bericht);

    const result = await service.voegBerichtToe('g1', 'student', 'Hallo');

    expect(berichtRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ gesprekId: 'g1', rol: 'student', inhoud: 'Hallo' }),
    );
    expect(result.inhoud).toBe('Hallo');
  });
});
