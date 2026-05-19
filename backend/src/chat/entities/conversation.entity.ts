import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'boolean', default: false })
  titleManuallyEdited!: boolean;

  @Column({ type: 'int', default: 0 })
  titleRevisionCount!: number;

  @OneToMany(() => MessageEntity, (message) => message.conversation, { cascade: true })
  messages!: MessageEntity[];
}
