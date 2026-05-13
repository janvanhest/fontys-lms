import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from './database/database.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { ToolsModule } from './tools/tools.module';
import { ChatModule } from './chat/chat.module';
import { SeedModule } from './seed/seed.module';
import { DbModule } from './db/db.module';
import { InfoModule } from './info/info.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    DatabaseModule,
    EmbeddingModule,
    ToolsModule,
    ChatModule,
    SeedModule,
    DbModule,
    InfoModule,
  ],
})
export class AppModule {}
