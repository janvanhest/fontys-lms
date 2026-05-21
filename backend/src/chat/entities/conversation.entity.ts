import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MessageEntity } from './message.entity';

@Entity('conversations')
export class ConversationEntity {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiPropertyOptional({ example: 'Semesterplan hulp' })
  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @ApiProperty({ type: () => [MessageEntity] })
  @OneToMany(() => MessageEntity, (message) => message.conversation, { cascade: true })
  messages!: MessageEntity[];

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'boolean', default: false })
  titleManuallyEdited!: boolean;

  @Column({ type: 'int', default: 0 })
  titleRevisionCount!: number;
}
