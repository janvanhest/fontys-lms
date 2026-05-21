import { Test, TestingModule } from '@nestjs/testing';
import { PERFORM_UI_ACTION_TOOL_DEF, PerformUiActionTool } from './perform-ui-action.tool';

describe('PerformUiActionTool', () => {
  let tool: PerformUiActionTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformUiActionTool],
    }).compile();

    tool = module.get<PerformUiActionTool>(PerformUiActionTool);
  });

  it('defines the tool contract with action and mode enums', () => {
    expect(PERFORM_UI_ACTION_TOOL_DEF.name).toBe('perform_ui_action');
    expect(PERFORM_UI_ACTION_TOOL_DEF.input_schema.properties.action.enum).toEqual([
      'open_activities_panel',
    ]);
    expect(PERFORM_UI_ACTION_TOOL_DEF.input_schema.properties.mode.enum).toEqual([
      'auto',
      'suggest',
    ]);
    expect(PERFORM_UI_ACTION_TOOL_DEF.input_schema.required).toEqual(
      expect.arrayContaining(['action', 'mode', 'label']),
    );
    expect(PERFORM_UI_ACTION_TOOL_DEF.input_schema.additionalProperties).toBe(false);
  });

  it('returns parseable ok result without calling any service', () => {
    const result = tool.execute();
    expect(JSON.parse(result)).toEqual({ ok: true });
  });
});
