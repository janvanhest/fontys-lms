import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity, MessageRole } from './message.entity';
import { ConversationEntity } from './conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async createConversation(studentId: string): Promise<ConversationEntity> {
    return this.conversationRepository.save({ studentId, messages: [] });
  }

  async findConversationsByStudent(studentId: string): Promise<ConversationEntity[]> {
    return this.conversationRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findConversationWithMessages(conversationId: string): Promise<ConversationEntity | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
      order: { messages: { timestamp: 'ASC' } },
    });
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
  ): Promise<MessageEntity> {
    return this.messageRepository.save({ conversationId, role, content });
  }
}
