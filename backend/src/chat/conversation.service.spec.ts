import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './entities/message.entity';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
  let service: ConversationService;
  let conversationRepo: jest.Mocked<
    Pick<Repository<ConversationEntity>, 'save' | 'find' | 'findOne' | 'update' | 'delete'>
  >;
  let messageRepo: jest.Mocked<Pick<Repository<MessageEntity>, 'save'>>;

  beforeEach(async () => {
    conversationRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    messageRepo = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: getRepositoryToken(ConversationEntity), useValue: conversationRepo },
        { provide: getRepositoryToken(MessageEntity), useValue: messageRepo },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  it('createConversation saves a conversation with studentId', async () => {
    const saved = { id: 'uuid-1', studentId: 'student-uuid', messages: [] } as ConversationEntity;
    conversationRepo.save.mockResolvedValue(saved);

    const result = await service.createConversation('student-uuid');

    expect(conversationRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-uuid',
        title: null,
        titleManuallyEdited: false,
        titleRevisionCount: 0,
      }),
    );
    expect(result.id).toBe('uuid-1');
  });

  it('findConversationsByStudent returns conversations sorted by date', async () => {
    const conversations = [
      { id: 'c1', studentId: 's1', createdAt: new Date('2026-05-17') },
      { id: 'c2', studentId: 's1', createdAt: new Date('2026-05-18') },
    ] as ConversationEntity[];
    conversationRepo.find.mockResolvedValue(conversations);

    const result = await service.findConversationsByStudent('s1');

    expect(conversationRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: 's1' } }),
    );
    expect(result).toHaveLength(2);
  });

  it('findConversationWithMessages scopes lookup to the current student', async () => {
    conversationRepo.findOne.mockResolvedValue(null);

    const result = await service.findConversationWithMessages('nonexistent', 'student-uuid');

    expect(conversationRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'nonexistent', studentId: 'student-uuid' },
      relations: ['messages'],
      order: { messages: { timestamp: 'ASC' } },
    });
    expect(result).toBeNull();
  });

  it('findConversationWithMessages returns a serializable conversation payload', async () => {
    const conversation = {
      id: 'c1',
      studentId: 'student-uuid',
      createdAt: new Date('2026-06-01T12:00:00.000Z'),
      title: 'Semesterplan hulp',
      titleManuallyEdited: false,
      titleRevisionCount: 0,
      messages: [
        {
          id: 'm1',
          role: 'assistant',
          content: 'Hier is je plan.',
          sources: null,
          timestamp: new Date('2026-06-01T12:01:00.000Z'),
          conversationId: 'c1',
          conversation: {} as ConversationEntity,
        },
      ],
      student: {
        id: 'student-uuid',
        conversations: [] as ConversationEntity[],
      },
    } as ConversationEntity & { student: { id: string; conversations: ConversationEntity[] } };
    conversation.messages[0].conversation = conversation;
    conversationRepo.findOne.mockResolvedValue(conversation);

    const result = await service.findConversationWithMessages('c1', 'student-uuid');

    expect(result).toEqual({
      id: 'c1',
      studentId: 'student-uuid',
      createdAt: new Date('2026-06-01T12:00:00.000Z'),
      title: 'Semesterplan hulp',
      titleManuallyEdited: false,
      titleRevisionCount: 0,
      messages: [
        {
          id: 'm1',
          role: 'assistant',
          content: 'Hier is je plan.',
          sources: null,
          timestamp: new Date('2026-06-01T12:01:00.000Z'),
          conversationId: 'c1',
        },
      ],
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('addMessage saves a message to the conversation', async () => {
    const message = {
      id: 'm1',
      conversationId: 'c1',
      role: 'student',
      content: 'Hello',
    } as MessageEntity;
    messageRepo.save.mockResolvedValue(message);

    const result = await service.addMessage('c1', 'student', 'Hello');

    expect(messageRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 'c1', role: 'student', content: 'Hello' }),
    );
    expect(result.content).toBe('Hello');
  });

  it('addMessage stores sources when provided for an assistant message', async () => {
    const message = {
      id: 'm2',
      conversationId: 'c1',
      role: 'assistant',
      content: 'Gebruik dit stappenplan.',
      sources: [
        {
          kind: 'canvas',
          label: 'Canvas: Stappenplan',
          url: 'https://canvas.example/stappenplan',
        },
      ],
    } as MessageEntity;
    messageRepo.save.mockResolvedValue(message);

    const result = await service.addMessage('c1', 'assistant', 'Gebruik dit stappenplan.', [
      {
        kind: 'canvas',
        label: 'Canvas: Stappenplan',
        url: 'https://canvas.example/stappenplan',
      },
    ]);

    expect(messageRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'c1',
        role: 'assistant',
        content: 'Gebruik dit stappenplan.',
        sources: [
          {
            kind: 'canvas',
            label: 'Canvas: Stappenplan',
            url: 'https://canvas.example/stappenplan',
          },
        ],
      }),
    );
    expect(result.sources).toEqual([
      {
        kind: 'canvas',
        label: 'Canvas: Stappenplan',
        url: 'https://canvas.example/stappenplan',
      },
    ]);
  });

  it('deleteConversation verwijdert het gesprek van de juiste student', async () => {
    conversationRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

    await service.deleteConversation('c1', 'student-uuid');

    expect(conversationRepo.delete).toHaveBeenCalledWith({
      id: 'c1',
      studentId: 'student-uuid',
    });
  });

  it('updateConversationTitle trims the title and marks it as manually edited', async () => {
    conversationRepo.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: [] });

    await service.updateConversationTitle('c1', 'student-uuid', '  Semesterplan hulp  ');

    expect(conversationRepo.update).toHaveBeenCalledWith(
      { id: 'c1', studentId: 'student-uuid' },
      {
        title: 'Semesterplan hulp',
        titleManuallyEdited: true,
      },
    );
  });
});
