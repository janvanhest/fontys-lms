import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BerichtEntity } from './bericht.entity';

@Entity('gesprekken')
export class GesprekEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @CreateDateColumn()
  aangemaaktOp!: Date;

  @OneToMany(() => BerichtEntity, (bericht) => bericht.gesprek, { cascade: true })
  berichten!: BerichtEntity[];
}
