import { plainToInstance } from 'class-transformer';
import { Activity } from '../activity.entity';
import { ActivityResponseDto } from './activity-response.dto';

export function toActivityResponseDto(activity: Activity): ActivityResponseDto {
  return plainToInstance(ActivityResponseDto, activity, {
    excludeExtraneousValues: true,
  });
}

export function toActivityResponseDtos(activities: Activity[]): ActivityResponseDto[] {
  return plainToInstance(ActivityResponseDto, activities, {
    excludeExtraneousValues: true,
  });
}
