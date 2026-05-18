import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentSearchService } from './document-search.service';

describe('DocumentSearchService', () => {
  let service: DocumentSearchService;
  let mockDataSource: jest.Mocked<Pick<DataSource, 'query'>>;
  let mockEmbeddingService: jest.Mocked<Pick<EmbeddingService, 'embedText'>>;

  beforeEach(async () => {
    mockDataSource = { query: jest.fn() };
    mockEmbeddingService = { embedText: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSearchService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
      ],
    }).compile();

    service = module.get<DocumentSearchService>(DocumentSearchService);
  });

  it('geeft lege string terug als embedText null is', async () => {
    mockEmbeddingService.embedText.mockResolvedValue(null);

    const result = await service.zoekRelevanteChunks('test query');

    expect(result).toBe('');
    expect(mockDataSource.query).not.toHaveBeenCalled();
  });

  it('voert pgvector query uit en combineert content', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockDataSource.query.mockResolvedValue([
      { content: 'Eerste chunk.' },
      { content: 'Tweede chunk.' },
    ]);

    const result = await service.zoekRelevanteChunks('challenge beschrijving');

    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY embedding <=> $1::vector'),
      ['[0.1,0.2,0.3]', 5],
    );
    expect(mockDataSource.query).not.toHaveBeenCalledWith(
      expect.stringContaining('real[]'),
      expect.anything(),
    );
    expect(result).toContain('Eerste chunk.');
    expect(result).toContain('Tweede chunk.');
  });

  it('geeft lege string terug als query geen resultaten heeft', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2]);
    mockDataSource.query.mockResolvedValue([]);

    const result = await service.zoekRelevanteChunks('onbekend onderwerp');

    expect(result).toBe('');
  });
});
