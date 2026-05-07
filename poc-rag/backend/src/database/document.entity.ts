import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface DocumentMetadata {
  source: string;
  title: string;
  chunkIndex: number;
}

@Entity({ name: 'documents' })
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'vector',
    length: 768,
    nullable: true,
  })
  embedding!: number[] | null;

  @Column({ type: 'jsonb' })
  metadata!: DocumentMetadata;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

