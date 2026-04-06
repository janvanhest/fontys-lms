import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentEntity } from './document.entity';
import { DatabaseSeederService } from './database-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([DocumentEntity]),
    EmbeddingModule,
  ],
  providers: [DatabaseSeederService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
