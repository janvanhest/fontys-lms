import { Exclude } from 'class-transformer';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const ACTIVITY_STATUSES = ['open', 'bezig', 'feedback', 'afgerond'] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_TYPES = [
  'opdracht',
  'workshop',
  'competentie',
  'eigen activiteit',
  'challenge',
  'coaching',
  'sprint review',
  'semesterplan',
  'posterpresentatie',
  'overdracht',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const ACTIVITY_STATUS_CHECK = `"status" IN (${ACTIVITY_STATUSES.map((status) => `'${status}'`).join(', ')})`;
const ACTIVITY_TYPE_CHECK = `"type" IN (${ACTIVITY_TYPES.map((type) => `'${type}'`).join(', ')})`;

@Entity('activities')
@Check('CHK_activities_status', ACTIVITY_STATUS_CHECK)
@Check('CHK_activities_type', ACTIVITY_TYPE_CHECK)
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Exclude()
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
