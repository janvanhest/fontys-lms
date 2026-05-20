import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from '../activity/activity.service';
import { StudentService } from '../student/student.service';

const MOCK_STUDENT = {
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
};

@Injectable()
export class DevSeederService implements OnModuleInit {
  private readonly logger = new Logger(DevSeederService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly studentService: StudentService,
    private readonly activityService: ActivityService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.configService.get<boolean>('MOCK_AUTH', false)) {
      return;
    }

    const student = await this.studentService.findOrCreate(MOCK_STUDENT);
    await this.activityService.seed(student.id);
    this.logger.log(`Activities geseed voor mock student (${MOCK_STUDENT.displayName})`);
  }
}
