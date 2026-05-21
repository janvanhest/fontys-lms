import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
import { AppInfoResponseDto } from './app-info-response.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'API info' })
  @ApiOkResponse({ type: AppInfoResponseDto })
  getInfo(): AppInfoResponseDto {
    return this.appService.getInfo();
  }
}
