import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity, MessageRole, MessageSource } from './entities/message.entity';
import { ConversationEntity } from './entities/conversation.entity';

export type ConversationMessageView = Pick<
  MessageEntity,
  'id' | 'role' | 'content' | 'sources' | 'timestamp' | 'conversationId'
>;

export type ConversationWithMessagesView = Pick<
  ConversationEntity,
  'id' | 'createdAt' | 'title' | 'studentId' | 'titleManuallyEdited' | 'titleRevisionCount'
> & {
  messages: ConversationMessageView[];
};

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async createConversation(studentId: string): Promise<ConversationEntity> {
    return this.conversationRepository.save({
      studentId,
      title: null,
      titleManuallyEdited: false,
      titleRevisionCount: 0,
      messages: [],
    });
  }

  async findConversationsByStudent(studentId: string): Promise<ConversationEntity[]> {
    return this.conversationRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findConversationWithMessages(
    conversationId: string,
    studentId: string,
  ): Promise<ConversationWithMessagesView | null> {
    const result = await this.conversationRepository.findOne({
      where: { id: conversationId, studentId },
      relations: ['messages'],
      order: { messages: { timestamp: 'ASC' } },
    });
    if (!result) return null;
    // Return the API shape explicitly so future ORM relations cannot leak
    // circular references back into the serialized response.
    return {
      id: result.id,
      createdAt: result.createdAt,
      title: result.title,
      studentId: result.studentId,
      titleManuallyEdited: result.titleManuallyEdited,
      titleRevisionCount: result.titleRevisionCount,
      messages: result.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        sources: message.sources,
        timestamp: message.timestamp,
        conversationId: message.conversationId,
      })),
    };
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    sources?: MessageSource[],
  ): Promise<MessageEntity> {
    return this.messageRepository.save({
      conversationId,
      role,
      content,
      sources: sources && sources.length > 0 ? sources : null,
    });
  }

  async updateConversationTitle(
    conversationId: string,
    studentId: string,
    title: string,
  ): Promise<void> {
    await this.conversationRepository.update(
      { id: conversationId, studentId },
      {
        title: title.trim(),
        titleManuallyEdited: true,
      },
    );
  }

  async updateAutoConversationTitle(
    conversationId: string,
    title: string,
    titleRevisionCount: number,
  ): Promise<void> {
    await this.conversationRepository.update(
      {
        id: conversationId,
        titleManuallyEdited: false,
      },
      {
        title: title.trim(),
        titleRevisionCount,
      },
    );
  }
}
