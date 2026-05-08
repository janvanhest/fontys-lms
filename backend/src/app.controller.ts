import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EchoMessageDto } from './echo-message.dto';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  /**
   * The AppController defines basic application endpoints for demonstration and validation.
   * It exposes a hello-world route and an echo route that returns validated input.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a simple hello-world style message from the application.
   * This endpoint demonstrates a basic GET route that delegates to the service layer.
   *
   * @returns A greeting message provided by the application service.
   */
  @Get()
  @ApiOperation({ summary: 'API info' })
  getInfo(): { name: string; version: string } {
    return this.appService.getInfo();
  }

  /**
   * Echoes back the validated request body.
   * This endpoint serves to validate the incoming DTO and return it unchanged.
   *
   * @param body The incoming message payload to validate and echo.
   * @returns The same message payload that was provided in the request body.
   */
  @Post('echo')
  @ApiOperation({ summary: 'Echo endpoint voor DTO-validatie' })
  echo(@Body() body: EchoMessageDto): EchoMessageDto {
    return body;
  }
}
