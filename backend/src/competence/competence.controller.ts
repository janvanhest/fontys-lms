import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { CompetenceService } from './competence.service';
import { CompetenceFrameworkDto } from './dto/competence-framework.dto';
import { CompetenceResponseDto } from './dto/competence-response.dto';
import {
  toCompetenceResponseDto,
  toCompetenceResponseDtos,
} from './dto/competence-response.mapper';
import { SetCompetenceDto } from './dto/set-competence.dto';

@ApiTags('competences')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('competences')
export class CompetenceController {
  constructor(private readonly competenceService: CompetenceService) {}

  @Get()
  @ApiOperation({ summary: 'Competentievoortgang van de ingelogde student' })
  @ApiOkResponse({ type: [CompetenceResponseDto] })
  findAll(@CurrentStudent() student: Student): Promise<CompetenceResponseDto[]> {
    return this.competenceService.findAll(student.id).then(toCompetenceResponseDtos);
  }

  @Get('framework')
  @ApiOperation({ summary: 'De HBO-i raamwerkstructuur: lagen, activiteiten en cellen' })
  @ApiOkResponse({ type: CompetenceFrameworkDto })
  getFramework(): Promise<CompetenceFrameworkDto> {
    return this.competenceService.getFramework();
  }

  @Put()
  @ApiOperation({ summary: 'Behaald en gekozen niveau voor een competentie zetten' })
  @ApiOkResponse({ type: CompetenceResponseDto })
  set(
    @Body() dto: SetCompetenceDto,
    @CurrentStudent() student: Student,
  ): Promise<CompetenceResponseDto> {
    return this.competenceService.setCompetence(student.id, dto).then(toCompetenceResponseDto);
  }
}
