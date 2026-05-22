import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetenceFramework } from './competence-framework.entity';
import { CompetenceProgress } from './competence-progress.entity';
import { CompetenceController } from './competence.controller';
import { CompetenceService } from './competence.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetenceProgress, CompetenceFramework])],
  controllers: [CompetenceController],
  providers: [CompetenceService],
  exports: [CompetenceService],
})
export class CompetenceModule {}
