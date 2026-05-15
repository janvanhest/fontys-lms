import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { HealthController } from './health.controller';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    EmbeddingModule,
    SearchModule,
    ChatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

