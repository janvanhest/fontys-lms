import { Injectable } from '@nestjs/common';

export const STUDENT_CONTEXT_TOOL_DEF = {
  name: 'get_student_context',
  description:
    'Haalt de actieve challenge, recente activiteiten en beroepstaakkoppelingen op van de student. Gebruik dit als de vraag gaat over de voortgang, challenge of activiteiten van de student.',
  input_schema: {
    type: 'object' as const,
    properties: {
      studentId: { type: 'string', description: 'Het UUID van de student' },
    },
    required: ['studentId'],
  },
};

@Injectable()
export class StudentContextTool {
  async execute(studentId: string): Promise<string> {
    // TODO: vervangen door echte TypeORM queries zodra Challenge/Activiteit entities beschikbaar zijn (E-02, E-03)
    return JSON.stringify({
      studentId,
      available: false,
      temporary: true,
      actieveChallenge: null,
      recenteActiviteiten: [],
      beroepstaakkoppelingen: [],
      notitie:
        'Studentdata nog niet beschikbaar — challenges en activiteiten worden in een volgende sprint geïmplementeerd.',
    });
  }
}
