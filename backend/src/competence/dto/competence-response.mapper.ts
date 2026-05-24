import { plainToInstance } from 'class-transformer';
import { CompetenceProgress } from '../competence-progress.entity';
import { CompetenceResponseDto } from './competence-response.dto';

export function toCompetenceResponseDto(entity: CompetenceProgress): CompetenceResponseDto {
  return plainToInstance(CompetenceResponseDto, entity, {
    excludeExtraneousValues: true,
  });
}

export function toCompetenceResponseDtos(entities: CompetenceProgress[]): CompetenceResponseDto[] {
  return plainToInstance(CompetenceResponseDto, entities, {
    excludeExtraneousValues: true,
  });
}
