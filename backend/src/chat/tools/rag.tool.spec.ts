import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSearchService } from '../../document/document-search.service';
import { RagTool } from './rag.tool';

describe('RagTool', () => {
  let tool: RagTool;
  let mockSearchService: jest.Mocked<Pick<DocumentSearchService, 'zoekRelevanteChunks'>>;

  beforeEach(async () => {
    mockSearchService = { zoekRelevanteChunks: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagTool,
        { provide: DocumentSearchService, useValue: mockSearchService },
      ],
    }).compile();

    tool = module.get<RagTool>(RagTool);
  });

  it('delegeert query naar DocumentSearchService', async () => {
    mockSearchService.zoekRelevanteChunks.mockResolvedValue({
      content: 'Relevante inhoud.',
      sources: [],
    });

    const result = await tool.execute('wat is een beroepstaak');

    expect(mockSearchService.zoekRelevanteChunks).toHaveBeenCalledWith('wat is een beroepstaak');
    expect(result).toEqual({ content: 'Relevante inhoud.', sources: [] });
  });

  it('geeft leeg object terug als geen resultaten', async () => {
    mockSearchService.zoekRelevanteChunks.mockResolvedValue({ content: '', sources: [] });

    const result = await tool.execute('onbekende query');

    expect(result).toEqual({ content: '', sources: [] });
  });
});
