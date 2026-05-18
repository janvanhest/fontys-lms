import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  async check(): Promise<HealthCheckResponseDto> {
    return this.healthService.check();
  }
}
