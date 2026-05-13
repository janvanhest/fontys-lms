import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TOOL_DEFINITIONS } from '../tools/tool-definitions';
import { buildSystemPrompt } from '../chat/prompts';
import { PgService } from '../database/pg.service';

@ApiTags('info')
@Controller('info')
export class InfoController {
  constructor(private readonly pg: PgService) {}

  @Get()
  @ApiOperation({ summary: 'Live stack-info, system prompt, tool-definitions en counts voor de UI Info tab.' })
  async getInfo() {
    const counts = await this.fetchCounts();
    return {
      stack: {
        backend: 'NestJS 10 + Swagger + Anthropic SDK',
        database: 'PostgreSQL 16 met pgvector-extensie',
        relational_tables: ['student', 'voortgang', 'activiteit'],
        vector_table: 'hbo_chunk (768-dim embeddings)',
        chat_model: 'Anthropic Claude Sonnet 4.5',
        embedding_model: 'Ollama nomic-embed-text (lokaal, AVG-safe)',
        frontend: 'Vanilla HTML + JS, marked voor markdown',
      },
      counts,
      patterns: [
        {
          naam: 'RAG (Retrieval Augmented Generation)',
          uitleg: 'Zoek semantisch relevante tekstchunks in de vector DB (pgvector). De query van de gebruiker wordt geembed, daarna gebruikt de DB cosine-similarity om de meest verwante chunks terug te geven. Goed voor statische, gedeelde kennis zoals HBO-i definities of cursusinhoud.',
          tool: 'search_hbo_competentie',
          datasource: 'hbo_chunk tabel met embedding-kolom',
        },
        {
          naam: 'Function calling',
          uitleg: 'Claude besluit zelf welke functie hij aanroept (typisch een SQL-query op een relationele DB) om verse, gestructureerde data op te halen. Goed voor dynamische, per-gebruiker data zoals voortgang of planning.',
          tool: 'get_student_profiel / get_student_voortgang / get_student_activiteiten',
          datasource: 'student, voortgang, activiteit tabellen',
        },
        {
          naam: 'Hybride',
          uitleg: 'Beide patronen tegelijk in een chatbot. Claude bekijkt de vraag en besluit zelf welk patroon hij wanneer gebruikt. RAG voor "wat staat er in het HBO-i framework over X", function calling voor "wat is mijn huidige voortgang", en bij vragen als "wat moet ik doen om X te halen" combineert hij beide tot een gepersonaliseerd advies.',
          tool: 'combinatie van beide',
          datasource: 'hbo_chunk + relationele tabellen',
        },
      ],
      system_prompt: buildSystemPrompt(1),
      tools: TOOL_DEFINITIONS,
    };
  }

  private async fetchCounts() {
    const queries = await Promise.all([
      this.pg.query<{ c: string }>('SELECT COUNT(*)::text AS c FROM student'),
      this.pg.query<{ c: string }>('SELECT COUNT(*)::text AS c FROM voortgang'),
      this.pg.query<{ c: string }>('SELECT COUNT(*)::text AS c FROM activiteit'),
      this.pg.query<{ c: string }>('SELECT COUNT(*)::text AS c FROM hbo_chunk'),
    ]);
    return {
      students: Number(queries[0].rows[0].c),
      voortgang_rows: Number(queries[1].rows[0].c),
      activiteit_rows: Number(queries[2].rows[0].c),
      hbo_chunks: Number(queries[3].rows[0].c),
    };
  }
}
