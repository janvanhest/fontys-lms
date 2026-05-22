import { Test, TestingModule } from '@nestjs/testing';
import { CompetenceService } from '../../competence/competence.service';
import { CompetenceFrameworkDto } from '../../competence/dto/competence-framework.dto';
import { GetCompetenceFrameworkTool } from './get-competence-framework.tool';

const FRAMEWORK: CompetenceFrameworkDto = {
  layers: ['Infrastructure', 'Software'],
  activities: ['Analysis'],
  professionalDevelopmentAreas: [],
  cells: [
    {
      layer: 'Infrastructure',
      hboiActivity: 'Analysis',
      minLevel: 1,
      maxLevel: 3,
      levels: [{ level: 1, description: 'infra analyse niveau 1' }],
    },
    {
      layer: 'Software',
      hboiActivity: 'Analysis',
      minLevel: 1,
      maxLevel: 3,
      levels: [{ level: 1, description: 'software analyse niveau 1' }],
    },
  ],
};

describe('GetCompetenceFrameworkTool', () => {
  let tool: GetCompetenceFrameworkTool;
  let competenceService: { getFramework: jest.Mock };

  beforeEach(async () => {
    competenceService = { getFramework: jest.fn().mockResolvedValue(FRAMEWORK) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCompetenceFrameworkTool,
        { provide: CompetenceService, useValue: competenceService },
      ],
    }).compile();

    tool = module.get<GetCompetenceFrameworkTool>(GetCompetenceFrameworkTool);
  });

  it('returns all cells when no filter is given', async () => {
    const result = await tool.execute({});

    const parsed = JSON.parse(result) as { cells: unknown[] };
    expect(parsed.cells).toHaveLength(2);
  });

  it('filters cells by layer', async () => {
    const result = await tool.execute({ layer: 'Infrastructure' });

    const parsed = JSON.parse(result) as { cells: { layer: string }[] };
    expect(parsed.cells).toHaveLength(1);
    expect(parsed.cells[0].layer).toBe('Infrastructure');
  });
});
