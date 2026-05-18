import { Injectable } from '@nestjs/common';
import { DocumentSearchService } from './document-search.service';

export const RAG_TOOL_DEF = {
  name: 'search_course_content',
  description:
    'Zoekt in de geïndexeerde cursusinhoud naar informatie die relevant is voor de vraag. Gebruik dit voor vragen over begrippen, definities, het HBO-i raamwerk of cursusmateriaal.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'De zoekterm of vraag om relevante cursusinhoud mee te vinden',
      },
    },
    required: ['query'],
  },
};

@Injectable()
export class RagTool {
  constructor(private readonly documentSearchService: DocumentSearchService) {}

  async execute(query: string): Promise<string> {
    return this.documentSearchService.zoekRelevanteChunks(query);
  }
}
