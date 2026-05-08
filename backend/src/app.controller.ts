import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EchoMessageDto } from './echo-message.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API info' })
  getInfo(): { name: string; version: string } {
    return this.appService.getInfo();
  }

  @Post('echo')
  @ApiOperation({ summary: 'Echo endpoint voor DTO-validatie' })
  echo(@Body() body: EchoMessageDto): EchoMessageDto {
    return body;
  }
}
