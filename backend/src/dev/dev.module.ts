import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { DevController } from './dev.controller';

@Module({
  imports: [ActivityModule],
  controllers: [DevController],
})
export class DevModule {}
