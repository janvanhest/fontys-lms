import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PgService.name);
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await this.waitForReady();
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  private async waitForReady(maxTries = 20) {
    for (let i = 0; i < maxTries; i++) {
      try {
        await this.pool.query('SELECT 1');
        this.logger.log('Postgres bereikbaar');
        return;
      } catch (err) {
        this.logger.warn(`Wacht op postgres (${i + 1}/${maxTries})`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    throw new Error('Postgres niet bereikbaar');
  }

  query<T = any>(text: string, params: any[] = []): Promise<{ rows: T[] }> {
    return this.pool.query(text, params);
  }
}
