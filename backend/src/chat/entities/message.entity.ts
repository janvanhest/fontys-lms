import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ enum: ['student', 'assistant'], example: 'assistant' })
  @Column({ type: 'varchar' })
  role!: MessageRole;

  @ApiProperty({ example: 'Dat is een goede vraag!' })
  @Column({ type: 'text' })
  content!: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        kind: { type: 'string' },
        label: { type: 'string' },
        url: { type: 'string', nullable: true },
      },
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  sources!: MessageSource[] | null;

  @ApiProperty()
  @CreateDateColumn()
  timestamp!: Date;

  @Column({ type: 'uuid' })
  conversationId!: string;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  conversation!: ConversationEntity;
}
