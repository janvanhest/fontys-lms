import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Wat is een professionele taak?' })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-...' })
  @IsUUID()
  @IsOptional()
  conversationId?: string;
}
