import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GesprekEntity } from './gesprek.entity';

export type BerichtRol = 'student' | 'assistent';

@Entity('berichten')
export class BerichtEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  gesprekId!: string;

  @ManyToOne(() => GesprekEntity, (gesprek) => gesprek.berichten, {
    onDelete: 'CASCADE',
  })
  gesprek!: GesprekEntity;

  @Column({ type: 'varchar' })
  rol!: BerichtRol;

  @Column({ type: 'text' })
  inhoud!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
