import { Injectable } from '@nestjs/common';
import packageJson from '../package.json';

@Injectable()
export class AppService {
  getInfo(): { name: string; version: string } {
    return {
      name: packageJson.name,
      version: packageJson.version,
    };
  }
}
