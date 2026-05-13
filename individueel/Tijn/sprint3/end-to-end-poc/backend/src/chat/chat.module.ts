import { Module } from '@nestjs/common';
import { ToolsModule } from '../tools/tools.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [ToolsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
