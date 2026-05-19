import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import {
  DocumentSearchService,
  DocumentSearchUnavailableError,
} from './document-search.service';

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

  it('throws a specific error when embeddings are unavailable', async () => {
    mockEmbeddingService.embedText.mockResolvedValue(null);

    await expect(service.zoekRelevanteChunks('test query')).rejects.toBeInstanceOf(
      DocumentSearchUnavailableError,
    );
    expect(mockDataSource.query).not.toHaveBeenCalled();
  });

  it('voert pgvector query uit en retourneert content plus bronmetadata', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockDataSource.query.mockResolvedValue([
      {
        content: 'Eerste chunk.',
        source: 'canvas',
        title: 'Stappenplan',
        url: 'https://canvas.example/stappenplan',
      },
      {
        content: 'Tweede chunk.',
        source: 'canvas',
        title: 'Portflow',
        url: 'https://canvas.example/portflow',
      },
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
    expect(result).toEqual({
      content: 'Eerste chunk.\n\n---\n\nTweede chunk.',
      sources: [
        {
          kind: 'canvas',
          label: 'Canvas: Stappenplan',
          url: 'https://canvas.example/stappenplan',
        },
        {
          kind: 'canvas',
          label: 'Canvas: Portflow',
          url: 'https://canvas.example/portflow',
        },
      ],
    });
  });

  it('geeft leeg resultaat terug als query geen resultaten heeft', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2]);
    mockDataSource.query.mockResolvedValue([]);

    const result = await service.zoekRelevanteChunks('onbekend onderwerp');

    expect(result).toEqual({ content: '', sources: [] });
  });

  it('throws a specific error when the vector query fails', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockDataSource.query.mockRejectedValue(new Error('database down'));

    await expect(service.zoekRelevanteChunks('challenge beschrijving')).rejects.toBeInstanceOf(
      DocumentSearchUnavailableError,
    );
  });
});
