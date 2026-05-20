import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ActivityStatus = 'open' | 'bezig' | 'feedback' | 'afgerond';
export type ActivityType =
  | 'opdracht'
  | 'workshop'
  | 'competentie'
  | 'eigen activiteit'
  | 'challenge'
  | 'coaching'
  | 'sprint review'
  | 'semesterplan'
  | 'posterpresentatie'
  | 'overdracht';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'int', nullable: true })
  portflowId!: number | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column()
  type!: ActivityType;

  @Column({ default: 'open' })
  status!: ActivityStatus;

  @Column({ type: 'date', nullable: true })
  deadline!: string | null;

  @Column({ type: 'varchar', nullable: true })
  competencyLabel!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
