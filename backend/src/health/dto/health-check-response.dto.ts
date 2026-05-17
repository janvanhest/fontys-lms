import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: string;

  @ApiPropertyOptional({ example: { database: { status: 'down', message: 'Connection refused' } } })
  details?: Record<string, unknown>;
}
