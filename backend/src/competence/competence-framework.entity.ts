import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { HboiActivity, HboiLayer } from './competence-progress.entity';

// Eén rij = de officiele beschrijving van één competentie (laag x activiteit x
// niveau) uit het HBO-i raamwerk. Statische referentiedata, gevuld door de
// migratie. Gelijk voor elke student.
@Entity('competence_framework')
export class CompetenceFramework {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  layer!: HboiLayer;

  @Column()
  hboiActivity!: HboiActivity;

  @Column({ type: 'int' })
  level!: number;

  @Column({ type: 'text' })
  description!: string;
}
