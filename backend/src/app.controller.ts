import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppInfoResponseDto } from './app-info-response.dto';
import { EchoMessageDto } from './echo-message.dto';
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

  @Post('echo')
  @ApiOperation({ summary: 'Echo endpoint voor DTO-validatie' })
  @ApiOkResponse({ type: EchoMessageDto })
  @ApiBadRequestResponse({ description: 'Validation failed for the request body.' })
  echo(@Body() body: EchoMessageDto): EchoMessageDto {
    return body;
  }
}
