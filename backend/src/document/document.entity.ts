import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

type DocumentMetadata = {
  source: string;
  title: string;
  url: string;
  chunkIndex: number;
};

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'real', array: true, nullable: true })
  embedding!: number[] | null;

  @Column({ type: 'jsonb' })
  metadata!: DocumentMetadata;

  @CreateDateColumn()
  createdAt!: Date;
}
