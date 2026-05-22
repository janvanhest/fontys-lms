import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ChatService, ChatSseEvent } from './chat.service';
import { ConversationService } from './conversation.service';
import { ConversationEntity } from './entities/conversation.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { RagTool } from './tools/rag.tool';
import { SearchActivitiesTool } from './tools/search-activities.tool';
import { StudentContextTool } from './tools/student-context.tool';
import { PerformUiActionTool } from './tools/perform-ui-action.tool';

const STUDENT_ID = 'student-uuid-001';

function makeStreamMock(
  textDeltas: string[],
  finalMsg: { stop_reason: string; content: Anthropic.ContentBlock[] },
) {
  const events = textDeltas.map((text) => ({
    type: 'content_block_delta' as const,
    delta: { type: 'text_delta' as const, text },
  }));
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const event of events) {
        yield event;
      }
    },
    finalMessage: jest.fn().mockResolvedValue(finalMsg),
  };
}

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
  let mockConfigService: { get: jest.Mock; getOrThrow: jest.Mock };
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
  let mockSearchActivitiesTool: jest.Mocked<Pick<SearchActivitiesTool, 'execute'>>;
  let mockPerformUiActionTool: jest.Mocked<Pick<PerformUiActionTool, 'execute'>>;
  let mockAnthropicStream: jest.Mock;
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
    mockSearchActivitiesTool = { execute: jest.fn().mockResolvedValue('{}') };
    mockPerformUiActionTool = { execute: jest.fn().mockReturnValue(JSON.stringify({ ok: true })) };
    mockAnthropicStream = jest.fn();
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'ANTHROPIC_MODEL') return 'claude-sonnet-test';
        return undefined;
      }),
      getOrThrow: jest.fn().mockReturnValue('sk-ant-test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ConversationService, useValue: mockConversationService },
        { provide: StudentContextTool, useValue: mockStudentTool },
        { provide: RagTool, useValue: mockRagTool },
        { provide: SearchActivitiesTool, useValue: mockSearchActivitiesTool },
        { provide: PerformUiActionTool, useValue: mockPerformUiActionTool },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    (service as unknown as { anthropic: { messages: { stream: jest.Mock } } }).anthropic = {
      messages: { stream: mockAnthropicStream },
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
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Answer.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Answer.' }] }),
    );

    const events = await collectEvents({ message: 'Hello' });

    expect(events[0].event).toBe('status');
  });

  it('sends final event with answer on end_turn', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['The answer.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'The answer.' }] }),
    );

    const events = await collectEvents({ message: 'What is a professional task?' });

    const final = events.find((e) => e.event === 'final');
    expect(final?.data).toBe(JSON.stringify({ text: 'The answer.', conversationId: 'c1' }));
  });

  it('emits text_delta events for each token chunk before the final event', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(
        ['Hello', ' world', '!'],
        { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Hello world!' }] },
      ),
    );

    const events = await collectEvents({ message: 'Say hello' });

    const deltas = events.filter((e) => e.event === 'text_delta');
    expect(deltas).toHaveLength(3);
    expect(deltas.map((e) => e.data)).toEqual(['Hello', ' world', '!']);

    const final = events.find((e) => e.event === 'final');
    expect(final).toBeDefined();
    const finalIndex = events.findIndex((e) => e.event === 'final');
    const lastDeltaIndex = events.map((e) => e.event).lastIndexOf('text_delta');
    expect(lastDeltaIndex).toBeGreaterThanOrEqual(0);
    expect(lastDeltaIndex).toBeLessThan(finalIndex);
  });

  it('emits stream_reset when a tool_use iteration streamed text before the tool call', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock(
        ['Intermediate text that should be discarded.'],
        { stop_reason: 'tool_use', content: [
          { type: 'tool_use', id: 'tc-reset', name: 'search_activities', input: {} },
        ] },
      ))
      .mockReturnValueOnce(makeStreamMock(
        ['Final answer.'],
        { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Final answer.' }] },
      ));
    mockSearchActivitiesTool.execute.mockResolvedValue('{}');

    const events = await collectEvents({ message: 'Welke deadlines heb ik?' });

    const resetIndex = events.findIndex((e) => e.event === 'stream_reset');
    expect(resetIndex).toBeGreaterThanOrEqual(0);

    // stream_reset must come after the intermediate text_delta
    const lastIntermediateDeltaIndex = events.map((e) => e.event).lastIndexOf('text_delta', resetIndex - 1);
    expect(lastIntermediateDeltaIndex).toBeGreaterThanOrEqual(0);
    expect(lastIntermediateDeltaIndex).toBeLessThan(resetIndex);

    // Final answer's text_delta events must come after the reset
    const finalDeltaIndex = events.findIndex(
      (e, i) => e.event === 'text_delta' && i > resetIndex,
    );
    expect(finalDeltaIndex).toBeGreaterThan(resetIndex);
  });

  it('does not emit stream_reset when tool_use iteration had no text', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock(
        [],
        { stop_reason: 'tool_use', content: [
          { type: 'tool_use', id: 'tc-no-text', name: 'search_activities', input: {} },
        ] },
      ))
      .mockReturnValueOnce(makeStreamMock(
        ['Clean answer.'],
        { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Clean answer.' }] },
      ));
    mockSearchActivitiesTool.execute.mockResolvedValue('{}');

    const events = await collectEvents({ message: 'Welke activiteiten heb ik?' });

    expect(events.some((e) => e.event === 'stream_reset')).toBe(false);
  });

  it('executes tool call and sends tool_call + tool_result events', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'professional task' },
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Combined answer.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Combined answer.' }] }));

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
    mockAnthropicStream.mockReturnValue(
      makeStreamMock([], { stop_reason: 'tool_use', content: [
        {
          type: 'tool_use',
          id: 'tc1',
          name: 'search_course_content',
          input: { query: 'professional task' },
        },
      ] }),
    );
    mockRagTool.execute.mockRejectedValue(new Error('Course search unavailable'));

    await expect(collectEvents({ message: 'What is a professional task?' })).rejects.toThrow(
      'Course search unavailable',
    );
  });

  it('derives the disabled student-context policy in the Anthropic request', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Answer.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Answer.' }] }),
    );

    await collectEvents({ message: 'How am I doing?' });

    expect(mockAnthropicStream).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-test',
        system: expect.stringContaining('get_student_context is tijdelijk uitgeschakeld'),
        tools: expect.arrayContaining([
          expect.objectContaining({ name: 'perform_ui_action' }),
          expect.objectContaining({ name: 'search_activities' }),
          expect.objectContaining({ name: 'search_course_content' }),
        ]),
      }),
    );
    expect(mockAnthropicStream.mock.calls[0]?.[0]?.tools).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'get_student_context' })]),
    );
  });

  it('executes search_activities tool calls with the student id and provided filters', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tc-activities',
            name: 'search_activities',
            input: { status: 'open', limit: 3 },
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Je hebt nog drie open activiteiten.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Je hebt nog drie open activiteiten.' }] }));
    mockSearchActivitiesTool.execute.mockResolvedValue(
      JSON.stringify({
        appliedFilters: { query: null, title: null, status: 'open', type: null, deadlineFrom: null, deadlineTo: null, limit: 3 },
        activities: [],
      }),
    );

    const events = await collectEvents({ message: 'Welke open activiteiten heb ik?' });

    expect(events.some((e) => e.event === 'tool_call')).toBe(true);
    expect(events.some((e) => e.event === 'tool_result')).toBe(true);
    expect(mockSearchActivitiesTool.execute).toHaveBeenCalledWith(STUDENT_ID, {
      status: 'open',
      limit: 3,
    });
    expect(mockRagTool.execute).not.toHaveBeenCalled();
  });

  it('returns the disabled student-context payload without executing the student tool', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tc-student-context',
            name: 'get_student_context',
            input: {},
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Ik kan alleen je activiteiten raadplegen.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Ik kan alleen je activiteiten raadplegen.' }] }));

    await collectEvents({ message: 'Hoe gaat het met mijn voortgang?' });

    expect(mockStudentTool.execute).not.toHaveBeenCalled();
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('student context tool called while disabled'),
    );
    expect(mockAnthropicStream.mock.calls[1]?.[0]?.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: [
            expect.objectContaining({
              type: 'tool_result',
              tool_use_id: 'tc-student-context',
              content: JSON.stringify({
                available: false,
                temporary: true,
                notitie:
                  'Studentcontext is tijdelijk uitgeschakeld totdat echte studentdata beschikbaar is.',
              }),
            }),
          ],
        }),
      ]),
    );
  });

  it('stops after max 6 iterations and sends fallback final event', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock([], { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'tc1', name: 'get_student_context', input: { studentId: 's1' } }] }),
    );

    const events = await collectEvents({ message: 'Infinite loop?' });

    const final = events.find((e) => e.event === 'final');
    expect(final).toBeDefined();
    expect(final?.data).toBe(
      JSON.stringify({
        text: 'Ik kon je vraag niet volledig beantwoorden binnen het maximale aantal stappen.',
        conversationId: 'c1',
      }),
    );
    expect(mockAnthropicStream).toHaveBeenCalledTimes(6);
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('tool loop iteration cap reached'),
    );
  });

  it('creates new conversation when conversationId is absent', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Hi.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Hi.' }] }),
    );

    await collectEvents({ message: 'Hi' }, STUDENT_ID);

    expect(mockConversationService.createConversation).toHaveBeenCalledWith(STUDENT_ID);
  });

  it('loads existing conversation when conversationId is present', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Hi.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Hi.' }] }),
    );

    await collectEvents({ message: 'Follow up', conversationId: 'c-existing' });

    expect(mockConversationService.findConversationWithMessages).toHaveBeenCalledWith(
      'c-existing',
      STUDENT_ID,
    );
  });

  it('generates an automatic title after the first complete assistant answer', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Je kunt starten met je semesterplan.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Je kunt starten met je semesterplan.' }] }),
    );

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
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Portflow helpt je bewijzen structureren.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Portflow helpt je bewijzen structureren.' }] }),
    );

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
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'stappenplan' },
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Gebruik het stappenplan als leidraad.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Gebruik het stappenplan als leidraad.' }] }));

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

  it('advertises perform_ui_action in the Anthropic tools array', async () => {
    mockAnthropicStream.mockReturnValue(
      makeStreamMock(['Antwoord.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Antwoord.' }] }),
    );

    await collectEvents({ message: 'Open mijn activiteiten' });

    expect(mockAnthropicStream).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({ name: 'perform_ui_action' }),
        ]),
      }),
    );
  });

  it('emits ui_action SSE event before tool_result when perform_ui_action is called', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tool-ui-1',
            name: 'perform_ui_action',
            input: { action: 'open_activities_panel', mode: 'auto', label: 'Open activiteiten' },
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Ik open het activiteitenpaneel.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Ik open het activiteitenpaneel.' }] }));

    const events = await collectEvents({ message: 'Open het activiteitenpaneel' });

    const uiActionIndex = events.findIndex((e) => e.event === 'ui_action');
    const toolResultIndex = events.findIndex((e) => e.event === 'tool_result');
    expect(uiActionIndex).toBeGreaterThanOrEqual(0);
    expect(uiActionIndex).toBeLessThan(toolResultIndex);
    expect(JSON.parse(events[uiActionIndex].data)).toEqual({
      action: 'open_activities_panel',
      mode: 'auto',
      label: 'Open activiteiten',
    });
    expect(mockPerformUiActionTool.execute).toHaveBeenCalledTimes(1);
  });

  it('deduplicates retrieved sources and limits them to the top 3', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tc1',
            name: 'search_course_content',
            input: { query: 'bronnen' },
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Hier zijn de belangrijkste bronnen.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Hier zijn de belangrijkste bronnen.' }] }));

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

  it('emits ui_action SSE event with activityId when highlight_activity is called', async () => {
    mockAnthropicStream
      .mockReturnValueOnce(makeStreamMock([], { stop_reason: 'tool_use', content: [
          {
            type: 'tool_use',
            id: 'tool-ui-2',
            name: 'perform_ui_action',
            input: {
              action: 'highlight_activity',
              mode: 'auto',
              label: 'Bekijk activiteit',
              activityId: 'activity-123',
            },
          },
        ] }))
      .mockReturnValueOnce(makeStreamMock(['Dit is de activiteit.'], { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Dit is de activiteit.' }] }));

    const events = await collectEvents({ message: 'Laat me activiteit 123 zien' });

    const uiActionEvent = events.find((e) => e.event === 'ui_action');
    expect(uiActionEvent).toBeDefined();
    expect(JSON.parse(uiActionEvent!.data)).toEqual({
      action: 'highlight_activity',
      mode: 'auto',
      label: 'Bekijk activiteit',
      activityId: 'activity-123',
    });
  });
});
