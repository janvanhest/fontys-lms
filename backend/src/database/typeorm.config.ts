import { join } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConversationEntity } from '../chat/entities/conversation.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { DocumentEntity } from '../document/document.entity';
import { Student } from '../student/student.entity';
import { Activity } from '../activity/activity.entity';
import { CompetenceProgress } from '../competence/competence-progress.entity';
import { CompetenceFramework } from '../competence/competence-framework.entity';

const entities = [
  ConversationEntity,
  MessageEntity,
  DocumentEntity,
  Student,
  Activity,
  CompetenceProgress,
  CompetenceFramework,
];
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
