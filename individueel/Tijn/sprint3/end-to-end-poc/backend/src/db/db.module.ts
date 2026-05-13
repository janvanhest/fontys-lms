import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DbController } from './db.controller';

@Module({
  imports: [EmbeddingModule],
  controllers: [DbController],
})
export class DbModule {}
