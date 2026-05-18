import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Anthropic from '@anthropic-ai/sdk';
import { ChatService, ChatSseEvent } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RagTool } from './rag.tool';
import { StudentContextTool } from './student-context.tool';

const STUDENT_ID = 'student-uuid-001';

const makeGesprek = (berichten: GesprekEntity['berichten'] = []): GesprekEntity =>
  ({ id: 'g1', studentId: STUDENT_ID, berichten } as unknown as GesprekEntity);

describe('ChatService', () => {
  let service: ChatService;
  let mockGesprekService: jest.Mocked<
    Pick<GesprekService, 'maakNieuwGesprek' | 'vindGesprekMetBerichten' | 'voegBerichtToe'>
  >;
  let mockStudentTool: jest.Mocked<Pick<StudentContextTool, 'execute'>>;
  let mockRagTool: jest.Mocked<Pick<RagTool, 'execute'>>;
  let mockAnthropicCreate: jest.Mock;

  beforeEach(async () => {
    mockGesprekService = {
      maakNieuwGesprek: jest.fn().mockResolvedValue(makeGesprek()),
      vindGesprekMetBerichten: jest.fn().mockResolvedValue(makeGesprek()),
      voegBerichtToe: jest.fn().mockResolvedValue({}),
    };
    mockStudentTool = { execute: jest.fn().mockResolvedValue('{}') };
    mockRagTool = { execute: jest.fn().mockResolvedValue('') };
    mockAnthropicCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: GesprekService, useValue: mockGesprekService },
        { provide: StudentContextTool, useValue: mockStudentTool },
        { provide: RagTool, useValue: mockRagTool },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('sk-ant-test') },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    (service as unknown as { anthropic: { messages: { create: jest.Mock } } }).anthropic = {
      messages: { create: mockAnthropicCreate },
    };
  });

  async function collectEvents(dto: SendMessageDto, studentId = STUDENT_ID) {
    const events: ChatSseEvent[] = [];
    for await (const e of service.streamAntwoord(dto, studentId)) {
      events.push(e);
    }
    return events;
  }

  it('stuurt status-event aan het begin', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Antwoord.' }],
    });

    const events = await collectEvents({ vraag: 'Hallo' });

    expect(events[0].event).toBe('status');
  });

  it('stuurt final-event met het antwoord bij end_turn', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Het antwoord.' }],
    });

    const events = await collectEvents({ vraag: 'Wat is een beroepstaak?' });

    const final = events.find((e) => e.event === 'final');
    expect(final?.data).toBe('Het antwoord.');
  });

  it('voert tool call uit en stuurt tool_call + tool_result events', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'beroepstaak' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Gecombineerd antwoord.' }],
      });

    mockRagTool.execute.mockResolvedValue('RAG resultaat.');

    const events = await collectEvents({ vraag: 'Wat is een beroepstaak?' });

    expect(events.some((e) => e.event === 'tool_call')).toBe(true);
    expect(events.some((e) => e.event === 'tool_result')).toBe(true);
    expect(mockRagTool.execute).toHaveBeenCalledWith('beroepstaak');
  });

  it('stopt na max 6 iteraties en stuurt fallback final-event', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [
        { type: 'tool_use', id: 'tc1', name: 'get_student_context', input: { studentId: 's1' } },
      ],
    });

    const events = await collectEvents({ vraag: 'Eindeloze lus?' });

    const final = events.find((e) => e.event === 'final');
    expect(final).toBeDefined();
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(6);
  });

  it('maakt nieuw gesprek aan als gesprekId ontbreekt', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hoi.' }],
    });

    await collectEvents({ vraag: 'Hoi' }, STUDENT_ID);

    expect(mockGesprekService.maakNieuwGesprek).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('laadt bestaand gesprek als gesprekId aanwezig is', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hoi.' }],
    });

    await collectEvents({ vraag: 'Vervolg', gesprekId: 'g-existing' });

    expect(mockGesprekService.vindGesprekMetBerichten).toHaveBeenCalledWith('g-existing');
  });
});
