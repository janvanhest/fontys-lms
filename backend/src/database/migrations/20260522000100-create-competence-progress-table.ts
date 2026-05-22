import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompetenceProgressTable20260522000100 implements MigrationInterface {
  name = 'CreateCompetenceProgressTable20260522000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "competence_progress" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" uuid NOT NULL,
        "layer" character varying NOT NULL,
        "hboiActivity" character varying NOT NULL,
        "achievedLevel" integer,
        "targetLevel" integer,
        "explanation" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_competence_progress_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_competence_progress_achievedLevel" CHECK ("achievedLevel" IS NULL OR "achievedLevel" BETWEEN 1 AND 3),
        CONSTRAINT "CHK_competence_progress_targetLevel" CHECK ("targetLevel" IS NULL OR "targetLevel" BETWEEN 1 AND 3)
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_competence_progress_student_cell"
      ON "competence_progress" ("studentId", "layer", "hboiActivity")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_competence_progress_student_cell"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "competence_progress"`);
  }
}
