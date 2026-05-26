import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from '../student/student.module';
import { CompetenceFramework } from './competence-framework.entity';
import { CompetenceProgress } from './competence-progress.entity';
import { CompetenceController } from './competence.controller';
import { CompetenceSeederService } from './competence-seeder.service';
import { CompetenceService } from './competence.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompetenceProgress, CompetenceFramework]), StudentModule],
  controllers: [CompetenceController],
  providers: [CompetenceService, CompetenceSeederService],
  exports: [CompetenceService],
})
export class CompetenceModule {}
