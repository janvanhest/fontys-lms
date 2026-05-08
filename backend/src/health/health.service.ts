import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  /**
   * Provides a simple health status for the application.
   * This service method is used to indicate whether the app is currently operational.
   *
   * @returns An object containing a status string representing the application's health.
   */
  check(): { status: string } {
    return { status: 'ok' };
  }
}
