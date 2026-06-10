import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { TitleGenerationService } from './title-generation.service';

jest.mock('@anthropic-ai/sdk');

const MockedAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

describe('TitleGenerationService', () => {
  let service: TitleGenerationService;
  let mockCreate: jest.Mock;

  beforeEach(async () => {
    mockCreate = jest.fn();
    MockedAnthropic.mockImplementation(
      () => ({ messages: { create: mockCreate } }) as unknown as Anthropic,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TitleGenerationService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('sk-ant-test') },
        },
      ],
    }).compile();

    service = module.get<TitleGenerationService>(TitleGenerationService);
  });

  it('geeft de gegenereerde titel terug bij een succesvolle response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Semesterplan hulp' }],
    });

    const result = await service.generateTitle(
      'Hoe maak ik een semesterplan?',
      'Een semesterplan bestaat uit een persoonlijk leerplan...',
    );

    expect(result).toBe('Semesterplan hulp');
  });

  it('geeft null terug bij een lege response', async () => {
    mockCreate.mockResolvedValue({ content: [] });

    const result = await service.generateTitle('vraag', 'antwoord');

    expect(result).toBeNull();
  });

  it('geeft null terug bij een lege titel na trimmen', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '   ' }],
    });

    const result = await service.generateTitle('vraag', 'antwoord');

    expect(result).toBeNull();
  });

  it('geeft null terug bij een API-fout en logt de fout', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const result = await service.generateTitle('vraag', 'antwoord');

    expect(result).toBeNull();
  });

  it('kapt het AI-antwoord af op 500 tekens voor verzending', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Titel' }],
    });
    const langAntwoord = 'x'.repeat(1000);

    await service.generateTitle('vraag', langAntwoord);

    const verzonden: string = mockCreate.mock.calls[0][0].messages[0].content;
    expect(verzonden).toContain('x'.repeat(500));
    expect(verzonden).not.toContain('x'.repeat(501));
  });

  it('gebruikt het Haiku-model', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Titel' }],
    });

    await service.generateTitle('vraag', 'antwoord');

    expect(mockCreate.mock.calls[0][0].model).toBe('claude-haiku-4-5-20251001');
  });
});
