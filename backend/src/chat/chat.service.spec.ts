import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ChatService, ChatSseEvent } from './chat.service';
import { ConversationService } from './conversation.service';
import { ConversationEntity } from './entities/conversation.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { RagTool } from './tools/rag.tool';
import { StudentContextTool } from './tools/student-context.tool';

const STUDENT_ID = 'student-uuid-001';

const makeConversation = (
  messages: ConversationEntity['messages'] = [],
  overrides: Partial<ConversationEntity> = {},
): ConversationEntity =>
  ({
    id: 'c1',
    studentId: STUDENT_ID,
    title: null,
    titleManuallyEdited: false,
    titleRevisionCount: 0,
    messages,
    ...overrides,
  }) as unknown as ConversationEntity;

describe('ChatService', () => {
  let service: ChatService;
  let mockConversationService: jest.Mocked<
    Pick<
      ConversationService,
      | 'createConversation'
      | 'findConversationWithMessages'
      | 'addMessage'
      | 'updateAutoConversationTitle'
    >
  >;
  let mockStudentTool: jest.Mocked<Pick<StudentContextTool, 'execute'>>;
  let mockRagTool: jest.Mocked<Pick<RagTool, 'execute'>>;
  let mockAnthropicCreate: jest.Mock;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockConversationService = {
      createConversation: jest.fn().mockResolvedValue(makeConversation()),
      findConversationWithMessages: jest.fn().mockResolvedValue(makeConversation()),
      addMessage: jest.fn().mockResolvedValue({}),
      updateAutoConversationTitle: jest.fn().mockResolvedValue({}),
    };
    mockStudentTool = { execute: jest.fn().mockResolvedValue('{}') };
    mockRagTool = { execute: jest.fn().mockResolvedValue('') };
    mockAnthropicCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ConversationService, useValue: mockConversationService },
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
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    loggerWarnSpy.mockRestore();
  });

  async function collectEvents(dto: SendMessageDto, studentId = STUDENT_ID) {
    const events: ChatSseEvent[] = [];
    for await (const e of service.streamResponse(dto, studentId)) {
      events.push(e);
    }
    return events;
  }

  it('sends status event at the start', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Answer.' }],
    });

    const events = await collectEvents({ message: 'Hello' });

    expect(events[0].event).toBe('status');
  });

  it('sends final event with answer on end_turn', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'The answer.' }],
    });

    const events = await collectEvents({ message: 'What is a professional task?' });

    const final = events.find((e) => e.event === 'final');
    expect(final?.data).toBe(JSON.stringify({ text: 'The answer.', conversationId: 'c1' }));
  });

  it('executes tool call and sends tool_call + tool_result events', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'professional task' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Combined answer.' }],
      });

    mockRagTool.execute.mockResolvedValue({
      content: 'RAG result.',
      sources: [
        {
          kind: 'canvas',
          label: 'Canvas: Professional Task',
          url: 'https://canvas.example/professional-task',
        },
      ],
    });

    const events = await collectEvents({ message: 'What is a professional task?' });

    expect(events.some((e) => e.event === 'tool_call')).toBe(true);
    expect(events.some((e) => e.event === 'tool_result')).toBe(true);
    expect(mockRagTool.execute).toHaveBeenCalledWith('professional task');
  });

  it('bubbles up search unavailability as an error event path', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tc1',
          name: 'search_course_content',
          input: { query: 'professional task' },
        },
      ],
    });
    mockRagTool.execute.mockRejectedValue(new Error('Course search unavailable'));

    await expect(collectEvents({ message: 'What is a professional task?' })).rejects.toThrow(
      'Course search unavailable',
    );
  });

  it('does not advertise the temporary student context tool to Anthropic', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Answer.' }],
    });

    await collectEvents({ message: 'How am I doing?' });

    expect(mockAnthropicCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: [expect.objectContaining({ name: 'search_course_content' })],
      }),
    );
  });

  it('stops after max 6 iterations and sends fallback final event', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [
        { type: 'tool_use', id: 'tc1', name: 'get_student_context', input: { studentId: 's1' } },
      ],
    });

    const events = await collectEvents({ message: 'Infinite loop?' });

    const final = events.find((e) => e.event === 'final');
    expect(final).toBeDefined();
    expect(final?.data).toBe(
      JSON.stringify({
        text: 'Ik kon je vraag niet volledig beantwoorden binnen het maximale aantal stappen.',
        conversationId: 'c1',
      }),
    );
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(6);
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('tool loop iteration cap reached'),
    );
  });

  it('creates new conversation when conversationId is absent', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hi.' }],
    });

    await collectEvents({ message: 'Hi' }, STUDENT_ID);

    expect(mockConversationService.createConversation).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('loads existing conversation when conversationId is present', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hi.' }],
    });

    await collectEvents({ message: 'Follow up', conversationId: 'c-existing' });

    expect(mockConversationService.findConversationWithMessages).toHaveBeenCalledWith('c-existing');
  });

  it('generates an automatic title after the first complete assistant answer', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Je kunt starten met je semesterplan.' }],
    });

    await collectEvents({ message: 'Kun je helpen met mijn semesterplan?' });

    expect(mockConversationService.updateAutoConversationTitle).toHaveBeenCalledWith(
      'c1',
      expect.stringMatching(/semesterplan/i),
      1,
    );
  });

  it('refines the automatic title only once for a longer conversation', async () => {
    mockConversationService.findConversationWithMessages.mockResolvedValue(
      makeConversation(
        [
          {
            role: 'student',
            content: 'Ik wil hulp met mijn semesterplan en portfolio.',
          },
          {
            role: 'assistant',
            content: 'Laten we naar beide kijken.',
          },
          {
            role: 'student',
            content: 'Ook wil ik weten hoe Portflow hierin past.',
          },
        ] as ConversationEntity['messages'],
        {
          title: 'Semesterplan hulp',
          titleRevisionCount: 1,
        },
      ),
    );
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Portflow helpt je bewijzen structureren.' }],
    });

    await collectEvents({
      message: 'Wat moet ik met Portflow doen?',
      conversationId: 'c-existing',
    });

    expect(mockConversationService.updateAutoConversationTitle).toHaveBeenCalledWith(
      'c1',
      expect.stringMatching(/portflow|semesterplan/i),
      2,
    );
  });

  it('includes retrieved sources in the final event payload', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'stappenplan' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Gebruik het stappenplan als leidraad.' }],
      });

    mockRagTool.execute.mockResolvedValue({
      content: 'Brontekst.',
      sources: [
        {
          kind: 'canvas',
          label: 'Canvas: Stappenplan',
          url: 'https://canvas.example/stappenplan',
        },
      ],
    });

    const events = await collectEvents({ message: 'Wat is het stappenplan?' });

    const final = events.find((e) => e.event === 'final');
    expect(final?.data).toBe(
      JSON.stringify({
        text: 'Gebruik het stappenplan als leidraad.',
        conversationId: 'c1',
        sources: [
          {
            kind: 'canvas',
            label: 'Canvas: Stappenplan',
            url: 'https://canvas.example/stappenplan',
          },
        ],
      }),
    );
    expect(mockConversationService.addMessage).toHaveBeenCalledWith(
      'c1',
      'assistant',
      'Gebruik het stappenplan als leidraad.',
      [
        {
          kind: 'canvas',
          label: 'Canvas: Stappenplan',
          url: 'https://canvas.example/stappenplan',
        },
      ],
    );
  });

  it('deduplicates retrieved sources and limits them to the top 3', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'bronnen' },
          },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Hier zijn de belangrijkste bronnen.' }],
      });

    mockRagTool.execute.mockResolvedValue({
      content: 'Brontekst.',
      sources: [
        {
          kind: 'canvas',
          label: 'Canvas: Stappenplan',
          url: 'https://canvas.example/stappenplan',
        },
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
        {
          kind: 'canvas',
          label: 'Canvas: Complexiteit',
          url: 'https://canvas.example/complexiteit',
        },
        {
          kind: 'canvas',
          label: 'Canvas: Agile Werken',
          url: 'https://canvas.example/agile',
        },
      ],
    });

    const events = await collectEvents({ message: 'Welke bronnen zijn geraadpleegd?' });

    const final = events.find((e) => e.event === 'final');
    expect(final?.data).toBe(
      JSON.stringify({
        text: 'Hier zijn de belangrijkste bronnen.',
        conversationId: 'c1',
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
          {
            kind: 'canvas',
            label: 'Canvas: Complexiteit',
            url: 'https://canvas.example/complexiteit',
          },
        ],
      }),
    );
  });
});
