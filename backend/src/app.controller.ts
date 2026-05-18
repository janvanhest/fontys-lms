import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppInfoResponseDto } from './app-info-response.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API info' })
  @ApiOkResponse({ type: AppInfoResponseDto })
  getInfo(): AppInfoResponseDto {
    return this.appService.getInfo();
  }
}
