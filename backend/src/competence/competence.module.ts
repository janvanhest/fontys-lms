import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetenceProgress } from './competence-progress.entity';
import { CompetenceController } from './competence.controller';
import { CompetenceService } from './competence.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetenceProgress])],
  controllers: [CompetenceController],
  providers: [CompetenceService],
  exports: [CompetenceService],
})
export class CompetenceModule {}
