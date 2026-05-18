import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: string;

  @ApiPropertyOptional({ example: { database: { status: 'up' } } })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { database: { status: 'down', message: 'Connection refused' } } })
  error?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { database: { status: 'up' } } })
  details?: Record<string, unknown>;
}
