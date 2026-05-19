import { Test, TestingModule } from '@nestjs/testing';
import { StudentContextTool } from './student-context.tool';

describe('StudentContextTool', () => {
  let tool: StudentContextTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentContextTool],
    }).compile();

    tool = module.get<StudentContextTool>(StudentContextTool);
  });

  it('geeft een JSON-string terug met studentId', async () => {
    const result = await tool.execute('student-uuid-42');

    const parsed = JSON.parse(result) as Record<string, unknown>;
    expect(parsed).toHaveProperty('studentId', 'student-uuid-42');
  });

  it('geeft altijd parseerbare JSON terug', async () => {
    const result = await tool.execute('any-id');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('markeert de response expliciet als tijdelijke placeholder', async () => {
    const result = await tool.execute('student-uuid-42');

    const parsed = JSON.parse(result) as Record<string, unknown>;
    expect(parsed).toHaveProperty('temporary', true);
    expect(parsed).toHaveProperty('available', false);
  });
});
