import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { ActivityService } from '../activity/activity.service';
import { toActivityResponseDtos } from '../activity/dto/activity-response.mapper';
import { ActivityResponseDto } from '../activity/dto/activity-response.dto';
import { Student } from '../student/student.entity';

@ApiTags('dev')
@Controller('dev')
export class DevController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('seed/activities')
  @ApiOperation({ summary: 'Seed mockdata voor de ingelogde student (dev only)' })
  @ApiOkResponse({ type: [ActivityResponseDto] })
  seedActivities(@CurrentStudent() student: Student): Promise<ActivityResponseDto[]> {
    return this.activityService.seed(student.id).then(toActivityResponseDtos);
  }
}
