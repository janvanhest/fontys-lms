import { Injectable } from '@nestjs/common';
import { CompetenceService } from '../../competence/competence.service';

export const GET_STUDENT_COMPETENCES_TOOL_DEF = {
  name: 'get_student_competences',
  description:
    'Haalt de competentievoortgang van de huidige student op: per laag en activiteit het ' +
    'behaalde niveau (achievedLevel) en het gekozen doelniveau (targetLevel). Gebruik dit voor ' +
    'vragen over waar de student staat of wat hij dit semester wil halen.',
  input_schema: {
    type: 'object' as const,
    properties: {},
  },
};

@Injectable()
export class GetStudentCompetencesTool {
  constructor(private readonly competenceService: CompetenceService) {}

  async execute(studentId: string): Promise<string> {
    const rows = await this.competenceService.findAll(studentId);
    const competences = rows.map((row) => ({
      layer: row.layer,
      hboiActivity: row.hboiActivity,
      achievedLevel: row.achievedLevel,
      targetLevel: row.targetLevel,
      explanation: row.explanation,
    }));
    return JSON.stringify({ competences });
  }
}
