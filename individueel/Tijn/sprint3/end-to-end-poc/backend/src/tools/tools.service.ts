import { Injectable, Logger } from '@nestjs/common';
import { toSql } from 'pgvector/pg';
import { PgService } from '../database/pg.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  constructor(private readonly pg: PgService, private readonly embedding: EmbeddingService) {}

  async execute(name: string, input: any): Promise<any> {
    this.logger.log(`tool call: ${name} ${JSON.stringify(input)}`);
    switch (name) {
      case 'search_hbo_competentie':
        return this.searchHboCompetentie(input.query, input.top_k ?? 5);
      case 'get_student_profiel':
        return this.getStudentProfiel(input.student_id);
      case 'get_student_voortgang':
        return this.getStudentVoortgang(input.student_id, input.laag, input.activiteit);
      case 'get_student_activiteiten':
        return this.getStudentActiviteiten(input.student_id, input.vanaf, input.tot);
      default:
        return { error: `Onbekende tool: ${name}` };
    }
  }

  private async searchHboCompetentie(query: string, topK: number) {
    const queryEmbedding = await this.embedding.embed(query);
    const { rows } = await this.pg.query(
      `SELECT laag, activiteit, niveau, content,
              1 - (embedding <=> $1::vector) AS similarity
       FROM hbo_chunk
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [toSql(queryEmbedding), topK],
    );
    return rows;
  }

  private async getStudentProfiel(studentId: number) {
    const { rows } = await this.pg.query(
      `SELECT id, naam, opleiding, semester, project_beschrijving
       FROM student WHERE id = $1`,
      [studentId],
    );
    return rows[0] || { error: `Geen student met id ${studentId}` };
  }

  private async getStudentVoortgang(studentId: number, laag?: string, activiteit?: string) {
    const params: any[] = [studentId];
    let sql = `SELECT laag, activiteit, niveau_behaald, niveau_bezig, toelichting
               FROM voortgang WHERE student_id = $1`;
    if (laag) {
      params.push(laag);
      sql += ` AND laag = $${params.length}`;
    }
    if (activiteit) {
      params.push(activiteit);
      sql += ` AND activiteit = $${params.length}`;
    }
    const { rows } = await this.pg.query(sql, params);
    return rows;
  }

  private async getStudentActiviteiten(studentId: number, vanaf?: string, tot?: string) {
    const params: any[] = [studentId];
    let sql = `SELECT titel, type, datum, afgerond, beschrijving
               FROM activiteit WHERE student_id = $1`;
    if (vanaf) {
      params.push(vanaf);
      sql += ` AND datum >= $${params.length}`;
    }
    if (tot) {
      params.push(tot);
      sql += ` AND datum <= $${params.length}`;
    }
    sql += ` ORDER BY datum`;
    const { rows } = await this.pg.query(sql, params);
    return rows;
  }
}
