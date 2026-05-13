import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { toSql } from 'pgvector/pg';
import { PgService } from '../database/pg.service';
import { EmbeddingService } from '../embedding/embedding.service';

class HboChunkInput {
  laag: string;
  activiteit: string;
  niveau: number;
  content: string;
}

@ApiTags('db-viewer')
@Controller('db')
export class DbController {
  constructor(private readonly pg: PgService, private readonly embedding: EmbeddingService) {}

  @Get('students')
  @ApiOperation({ summary: 'Relationele DB: alle studenten met hun voortgang en activiteiten' })
  async getStudents() {
    const { rows: students } = await this.pg.query(
      `SELECT id, naam, opleiding, semester, project_beschrijving
       FROM student ORDER BY id`,
    );
    for (const s of students as any[]) {
      const { rows: voortgang } = await this.pg.query(
        `SELECT laag, activiteit, niveau_behaald, niveau_bezig, toelichting
         FROM voortgang WHERE student_id = $1
         ORDER BY laag, activiteit`,
        [s.id],
      );
      const { rows: activiteiten } = await this.pg.query(
        `SELECT titel, type, datum, afgerond, beschrijving
         FROM activiteit WHERE student_id = $1
         ORDER BY datum`,
        [s.id],
      );
      s.voortgang = voortgang;
      s.activiteiten = activiteiten;
    }
    return students;
  }

  @Get('hbo-chunks')
  @ApiOperation({ summary: 'Vector DB: alle HBO-i chunks (zonder de raw embedding vector)' })
  async getHboChunks() {
    const { rows } = await this.pg.query(
      `SELECT id, laag, activiteit, niveau, content
       FROM hbo_chunk ORDER BY laag, activiteit, niveau, id`,
    );
    return rows;
  }

  @Post('hbo-chunks')
  @ApiOperation({ summary: 'Vector DB: nieuwe chunk toevoegen (server embed via Ollama)' })
  @ApiBody({ type: HboChunkInput })
  async addHboChunk(@Body() body: HboChunkInput) {
    const content = this.ensureHeading(body);
    const embedding = await this.embedding.embed(content);
    const { rows } = await this.pg.query<{ id: number }>(
      `INSERT INTO hbo_chunk (laag, activiteit, niveau, content, embedding)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [body.laag, body.activiteit, body.niveau, content, toSql(embedding)],
    );
    return { id: rows[0].id };
  }

  @Put('hbo-chunks/:id')
  @ApiOperation({ summary: 'Vector DB: chunk bijwerken (re-embed via Ollama)' })
  @ApiBody({ type: HboChunkInput })
  async updateHboChunk(@Param('id', ParseIntPipe) id: number, @Body() body: HboChunkInput) {
    const content = this.ensureHeading(body);
    const embedding = await this.embedding.embed(content);
    await this.pg.query(
      `UPDATE hbo_chunk
       SET laag = $1, activiteit = $2, niveau = $3, content = $4, embedding = $5
       WHERE id = $6`,
      [body.laag, body.activiteit, body.niveau, content, toSql(embedding), id],
    );
    return { updated: id };
  }

  private ensureHeading(body: HboChunkInput): string {
    const heading = `${body.laag} - ${body.activiteit} - Niveau ${body.niveau}`;
    return body.content.startsWith(heading) ? body.content : `${heading}\n\n${body.content}`;
  }

  @Delete('hbo-chunks/:id')
  @ApiOperation({ summary: 'Vector DB: chunk verwijderen' })
  async deleteHboChunk(@Param('id', ParseIntPipe) id: number) {
    await this.pg.query(`DELETE FROM hbo_chunk WHERE id = $1`, [id]);
    return { deleted: id };
  }
}
