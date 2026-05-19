import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageSourcesColumn20260519000200 implements MigrationInterface {
  name = 'AddMessageSourcesColumn20260519000200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD COLUMN IF NOT EXISTS "sources" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "messages"
      DROP COLUMN IF EXISTS "sources"
    `);
  }
}
