import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: string;

  @ApiPropertyOptional({ example: { message: 'Connection refused' } })
  details?: { message: string };
}
