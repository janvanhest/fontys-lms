import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { SeedService } from './seed.service';

@Module({
  imports: [EmbeddingModule],
  providers: [SeedService],
})
export class SeedModule {}
