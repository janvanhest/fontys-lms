import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { toSql } from 'pgvector/pg';
import { PgService } from '../database/pg.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly seedDir = process.env.SEED_DIR || '/seed';

  constructor(private readonly pg: PgService, private readonly embedding: EmbeddingService) {}

  async onModuleInit() {
    try {
      await this.seedStudents();
      await this.seedHboChunks();
    } catch (err) {
      this.logger.error('Seeding mislukt', err as Error);
    }
  }

  private async seedStudents() {
    const { rows } = await this.pg.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM student');
    if (Number(rows[0].count) > 0) {
      this.logger.log('Studenten al geseed, overslaan');
      return;
    }

    const path = join(this.seedDir, 'students.json');
    const raw = await readFile(path, 'utf-8');
    const data = JSON.parse(raw) as { students: any[] };

    for (const s of data.students) {
      const { rows: inserted } = await this.pg.query<{ id: number }>(
        `INSERT INTO student (naam, opleiding, semester, project_beschrijving)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [s.naam, s.opleiding, s.semester, s.project],
      );
      const studentId = inserted[0].id;

      for (const v of s.voortgang || []) {
        await this.pg.query(
          `INSERT INTO voortgang (student_id, laag, activiteit, niveau_behaald, niveau_bezig, toelichting)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [studentId, v.laag, v.activiteit, v.niveau_behaald, v.niveau_bezig, v.toelichting],
        );
      }

      for (const a of s.activiteiten || []) {
        await this.pg.query(
          `INSERT INTO activiteit (student_id, titel, type, datum, afgerond, beschrijving)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [studentId, a.titel, a.type, a.datum, !!a.afgerond, a.beschrijving],
        );
      }
    }

    this.logger.log(`Studenten geseed: ${data.students.length}`);
  }

  private async seedHboChunks() {
    // Defensieve drop: als een eerdere init.sql nog een lege ivfflat-index heeft achtergelaten,
    // wordt cosine-search via die index altijd 0 rijen geven. Voor PoC werken we zonder index.
    await this.pg.query('DROP INDEX IF EXISTS hbo_chunk_embedding_idx');
    await this.pg.query('DELETE FROM hbo_chunk');
    this.logger.log('HBO chunks tabel geleegd (index ook gedropt), opnieuw seeden');

    const path = join(this.seedDir, 'hbo-i-infrastructure.md');
    const raw = await readFile(path, 'utf-8');
    const chunks = this.parseMarkdown(raw);

    this.logger.log(`HBO chunks gevonden: ${chunks.length}, embeddings ophalen...`);
    for (const chunk of chunks) {
      const embedding = await this.embedding.embed(chunk.content);
      await this.pg.query(
        `INSERT INTO hbo_chunk (laag, activiteit, niveau, content, embedding)
         VALUES ($1, $2, $3, $4, $5)`,
        [chunk.laag, chunk.activiteit, chunk.niveau, chunk.content, toSql(embedding)],
      );
    }
    this.logger.log(`HBO chunks geseed: ${chunks.length}`);
  }

  private parseMarkdown(raw: string) {
    const sections = raw.split(/^##\s+/m).slice(1);
    return sections.map((s) => {
      const [headerLine, ...rest] = s.split('\n');
      const body = rest.join('\n').trim();
      const match = headerLine.match(/^(.+?)\s*-\s*(.+?)\s*-\s*Niveau\s*(\d+)/i);
      if (!match) {
        return { laag: 'Onbekend', activiteit: 'Onbekend', niveau: null, content: body };
      }
      const laag = match[1].trim();
      const activiteit = match[2].trim();
      const niveau = Number(match[3]);
      const heading = `${laag} - ${activiteit} - Niveau ${niveau}`;
      return { laag, activiteit, niveau, content: `${heading}\n\n${body}` };
    });
  }
}
