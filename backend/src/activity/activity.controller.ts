import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private toDto({ studentId: _studentId, ...rest }: Activity): ActivityResponseDto {
    return rest;
  }

  @Get()
  @ApiOperation({ summary: 'Alle activiteiten van de ingelogde student' })
  @ApiOkResponse({ type: [ActivityResponseDto] })
  async findAll(@CurrentStudent() student: Student): Promise<ActivityResponseDto[]> {
    const activities = await this.activityService.findAll(student.id);
    return activities.map((a) => this.toDto(a));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Één activiteit ophalen' })
  @ApiOkResponse({ type: ActivityResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.toDto(await this.activityService.findOne(id, student.id));
  }

  @Post()
  @ApiOperation({ summary: 'Nieuwe activiteit aanmaken' })
  @ApiOkResponse({ type: ActivityResponseDto })
  async create(
    @Body() dto: CreateActivityDto,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.toDto(await this.activityService.create(student.id, dto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Activiteit bijwerken' })
  @ApiOkResponse({ type: ActivityResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.toDto(await this.activityService.update(id, student.id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activiteit verwijderen' })
  remove(@Param('id') id: string, @CurrentStudent() student: Student): Promise<void> {
    return this.activityService.remove(id, student.id);
  }
}
