import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Provides a simple greeting message from the application.
   * This method is used to demonstrate a basic service response.
   *
   * @returns A static hello-world style greeting message.
   */
  getInfo(): { name: string; version: string } {
    return { name: 'Fontys LMS API', version: '1.0.0' };
  }
}
