import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './message.entity';
import { ConversationEntity } from './conversation.entity';
import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
  let service: ConversationService;
  let conversationRepo: jest.Mocked<Pick<Repository<ConversationEntity>, 'save' | 'find' | 'findOne'>>;
  let messageRepo: jest.Mocked<Pick<Repository<MessageEntity>, 'save'>>;

  beforeEach(async () => {
    conversationRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
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
      expect.objectContaining({ studentId: 'student-uuid' }),
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

  it('findConversationWithMessages returns null when conversation does not exist', async () => {
    conversationRepo.findOne.mockResolvedValue(null);

    const result = await service.findConversationWithMessages('nonexistent');

    expect(result).toBeNull();
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
});
