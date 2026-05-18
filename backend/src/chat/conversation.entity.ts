import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => MessageEntity, (message) => message.conversation, { cascade: true })
  messages!: MessageEntity[];
}
