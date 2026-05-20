import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable20260520000100 implements MigrationInterface {
  name = 'CreateActivitiesTable20260520000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" uuid NOT NULL,
        "portflowId" integer,
        "title" character varying NOT NULL,
        "description" text,
        "position" integer NOT NULL DEFAULT 0,
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'open',
        "deadline" date,
        "competencyLabel" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_activities_studentId" ON "activities" ("studentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_studentId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
  }
}
