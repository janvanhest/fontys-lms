import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CompetenceModule } from './competence/competence.module';
import { DatabaseModule } from './database/database.module';
import { DevModule } from './dev/dev.module';
import { DocumentModule } from './document/document.module';
import { validate } from './env.validation';
import { HealthModule } from './health/health.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DatabaseModule,
    AuthModule,
    StudentModule,
    HealthModule,
    DocumentModule,
    ChatModule,
    ActivityModule,
    CompetenceModule,
    ...(process.env.NODE_ENV !== 'production' ? [DevModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
