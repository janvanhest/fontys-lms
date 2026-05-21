import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateConversationTitleDto {
  @ApiProperty({ example: 'Semesterplan hulp' })
  @IsString()
  @MinLength(1)
  title!: string;
}
