import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class ChatHistoryItemDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ example: 'Ik wil Infrastructure Analyse niveau 2 behalen. Wat moet ik daarvoor doen?' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ default: 1, description: 'ID van de "ingelogde" student. Voor PoC hardcoded 1 (Sam de Vries).' })
  @IsOptional()
  @IsInt()
  student_id?: number;

  @ApiPropertyOptional({ type: [ChatHistoryItemDto], default: [] })
  @IsOptional()
  @IsArray()
  history?: ChatHistoryItemDto[];
}
