import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// HBO-i architectuurlagen. 'Professional Development' is de uitzondering: die kent
// geen activiteiten-uitsplitsing maar Personal Leadership / Professional Standard.
export type HboiLayer =
  | 'User Interaction'
  | 'Organisational Processes'
  | 'Infrastructure'
  | 'Software'
  | 'Hardware Interfacing'
  | 'Professional Development';

// De vijf HBO-i activiteiten (namen volgens de HBO-i Domeinbeschrijving 2023,
// sectie 2.2), plus de twee Professional Development-onderdelen die in het
// raamwerk de plek van een activiteit innemen.
export type HboiActivity =
  | 'Analysis'
  | 'Advise'
  | 'Design'
  | 'Realise'
  | 'Manage & Control'
  | 'Personal Leadership'
  | 'Professional Standard';

// Eén rij = de voortgang van één student op één cel (laag x activiteit) van het
// HBO-i raamwerk. achievedLevel is groen (al behaald), targetLevel is geel
// (gekozen als doel dit semester). Beide mogen leeg zijn.
@Entity('competence_progress')
export class CompetenceProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Exclude()
  @Column({ type: 'uuid' })
  studentId!: string;

  @Column()
  layer!: HboiLayer;

  @Column()
  hboiActivity!: HboiActivity;

  @Column({ type: 'int', nullable: true })
  achievedLevel!: number | null;

  @Column({ type: 'int', nullable: true })
  targetLevel!: number | null;

  @Column({ type: 'text', nullable: true })
  explanation!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
