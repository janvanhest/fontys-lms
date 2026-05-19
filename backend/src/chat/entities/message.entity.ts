import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationEntity } from './conversation.entity';

export type MessageRole = 'student' | 'assistant';
export type MessageSource = {
  kind: string;
  label: string;
  url: string | null;
};

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  conversationId!: string;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation!: ConversationEntity;

  @Column({ type: 'varchar' })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', nullable: true })
  sources!: MessageSource[] | null;

  @CreateDateColumn()
  timestamp!: Date;
}
