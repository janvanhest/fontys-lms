import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '@nestjs/common';
import { ChatService, ChatSseEvent } from './chat.service';
import { ConversationService } from './conversation.service';
import { ConversationEntity } from './conversation.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { RagTool } from './rag.tool';
import { StudentContextTool } from './student-context.tool';

const STUDENT_ID = 'student-uuid-001';

const makeConversation = (messages: ConversationEntity['messages'] = []): ConversationEntity =>
  ({ id: 'c1', studentId: STUDENT_ID, messages } as unknown as ConversationEntity);

describe('ChatService', () => {
  let service: ChatService;
  let mockConversationService: jest.Mocked<
    Pick<ConversationService, 'createConversation' | 'findConversationWithMessages' | 'addMessage'>
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
    expect(final?.data).toBe('The answer.');
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

    mockRagTool.execute.mockResolvedValue('RAG result.');

    const events = await collectEvents({ message: 'What is a professional task?' });

    expect(events.some((e) => e.event === 'tool_call')).toBe(true);
    expect(events.some((e) => e.event === 'tool_result')).toBe(true);
    expect(mockRagTool.execute).toHaveBeenCalledWith('professional task');
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
});
