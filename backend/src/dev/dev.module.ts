import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { StudentModule } from '../student/student.module';
import { DevController } from './dev.controller';
import { DevSeederService } from './dev-seeder.service';

@Module({
  imports: [ActivityModule, StudentModule],
  controllers: [DevController],
  providers: [DevSeederService],
})
export class DevModule {}
