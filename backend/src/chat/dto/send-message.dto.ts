import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export type ChatLanguage = 'nl' | 'en';

export class SendMessageDto {
  @ApiProperty({ example: 'Wat is een professionele taak?' })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @ApiPropertyOptional({ example: 'en', enum: ['nl', 'en'] })
  @IsIn(['nl', 'en'])
  @IsOptional()
  language?: ChatLanguage;
}
