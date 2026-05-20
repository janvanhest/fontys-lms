import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService } from './embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('http://ollama:11434'),
          },
        },
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns embedding array on successful response', async () => {
    const embedding = [0.1, 0.2, 0.3];
    fetchSpy.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ embedding }),
    });

    const result = await service.embedText('hello world');

    expect(result).toEqual(embedding);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://ollama:11434/api/embeddings',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: 'hello world' }),
      }),
    );
  });

  it('returns null when Ollama returns a non-200 response', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await service.embedText('hello world');

    expect(result).toBeNull();
  });

  it('returns null when fetch throws a network error', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await service.embedText('hello world');

    expect(result).toBeNull();
  });
});
