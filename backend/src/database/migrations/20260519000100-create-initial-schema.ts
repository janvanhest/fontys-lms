import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema20260519000100 implements MigrationInterface {
  name = 'CreateInitialSchema20260519000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "canvasUserId" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "email" character varying NOT NULL,
        "avatarUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_student_canvasUserId" UNIQUE ("canvasUserId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "title" character varying,
        "titleManuallyEdited" boolean NOT NULL DEFAULT false,
        "titleRevisionCount" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_conversations_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversationId" uuid NOT NULL,
        "role" character varying NOT NULL,
        "content" text NOT NULL,
        "sources" jsonb,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_conversationId" FOREIGN KEY ("conversationId")
          REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "embedding" vector(768),
        "metadata" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student"`);
  }
}
