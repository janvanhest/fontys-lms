import { Injectable } from '@nestjs/common';
import { CompetenceService } from '../../competence/competence.service';

export const GET_COMPETENCE_FRAMEWORK_TOOL_DEF = {
  name: 'get_competence_framework',
  description:
    'Haalt de officiele HBO-i competentiebeschrijvingen op uit het raamwerk. Optioneel te ' +
    'filteren op laag (layer) en/of activiteit (hboiActivity) om gericht een definitie op te ' +
    'halen. Gebruik dit om uit te leggen wat een competentie of niveau inhoudt.',
  input_schema: {
    type: 'object' as const,
    properties: {
      layer: {
        type: 'string',
        description: 'Optioneel. Filter op een laag, bijvoorbeeld Infrastructure of Software.',
      },
      hboiActivity: {
        type: 'string',
        description: 'Optioneel. Filter op een activiteit, bijvoorbeeld Analysis of Design.',
      },
    },
  },
};

export type GetCompetenceFrameworkInput = {
  layer?: string;
  hboiActivity?: string;
};

@Injectable()
export class GetCompetenceFrameworkTool {
  constructor(private readonly competenceService: CompetenceService) {}

  async execute(input: GetCompetenceFrameworkInput): Promise<string> {
    const framework = await this.competenceService.getFramework();
    let cells = framework.cells;
    if (input.layer) {
      cells = cells.filter((cell) => cell.layer === input.layer);
    }
    if (input.hboiActivity) {
      cells = cells.filter((cell) => cell.hboiActivity === input.hboiActivity);
    }
    return JSON.stringify({ cells });
  }
}
