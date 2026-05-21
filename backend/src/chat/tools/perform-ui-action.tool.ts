import { Injectable } from '@nestjs/common';

export const PERFORM_UI_ACTION_TOOL_DEF = {
  name: 'perform_ui_action',
  description:
    'Open or suggest a UI panel to the student. Use mode "auto" when the student explicitly asked; use "suggest" to show a clickable chip.',
  input_schema: {
    type: 'object' as const,
    required: ['action', 'mode', 'label'],
    additionalProperties: false,
    properties: {
      action: {
        type: 'string',
        enum: ['open_activities_panel'],
        description: 'Which panel to open',
      },
      mode: {
        type: 'string',
        enum: ['auto', 'suggest'],
        description: '"auto" executes immediately; "suggest" shows a chip the student can click',
      },
      label: {
        type: 'string',
        description: 'Button label shown to the student, e.g. "Open activiteiten"',
      },
    },
  },
};

export type PerformUiActionInput = {
  action: 'open_activities_panel';
  mode: 'auto' | 'suggest';
  label: string;
};

@Injectable()
export class PerformUiActionTool {
  execute(): string {
    return JSON.stringify({ ok: true });
  }
}
