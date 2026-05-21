import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  canvasUserId!: string;

  @Column()
  displayName!: string;

  @Column()
  email!: string;

  @Column({ nullable: true, type: 'varchar' })
  avatarUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
