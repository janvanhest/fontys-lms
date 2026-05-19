import { join } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConversationEntity } from '../chat/entities/conversation.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { DocumentEntity } from '../document/document.entity';
import { Student } from '../student/student.entity';

const entities = [ConversationEntity, MessageEntity, DocumentEntity, Student];
const migrations = [join(__dirname, 'migrations', '*{.ts,.js}')];

export function createTypeOrmOptions(databaseUrl: string): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities,
    migrations,
    synchronize: false,
    migrationsRun: true,
  };
}

export function createDataSourceOptions(databaseUrl: string): DataSourceOptions {
  return createTypeOrmOptions(databaseUrl) as DataSourceOptions;
}

export default new DataSource(
  createDataSourceOptions(
    process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  ),
);
