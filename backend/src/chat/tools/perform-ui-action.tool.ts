import { Injectable } from '@nestjs/common';
import { ALL_HBOI_ACTIVITIES, HBOI_LAYERS } from '../../competence/competence.constants';
import type { HboiActivity, HboiLayer } from '../../competence/competence-progress.entity';

export const PERFORM_UI_ACTION_TOOL_DEF = {
  name: 'perform_ui_action',
  description:
    'Open or suggest a UI element to the student: open the activities panel, highlight a specific activity, open the competences panel, or highlight a specific competence. Use mode "auto" when the student explicitly asked; use "suggest" to show a clickable chip.',
  input_schema: {
    type: 'object' as const,
    required: ['action', 'mode', 'label'],
    additionalProperties: false,
    properties: {
      action: {
        type: 'string',
        enum: [
          'open_activities_panel',
          'highlight_activity',
          'open_competences_panel',
          'highlight_competence',
        ],
        description: 'Which action to perform',
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
      activityId: {
        type: 'string',
        description:
          'Used when action is "highlight_activity". The exact id of the activity to highlight.',
      },
      competenceLayer: {
        type: 'string',
        enum: [...HBOI_LAYERS],
        description:
          'Used when action is "highlight_competence". The HBO-i layer of the competence, exactly as returned by get_student_competences or get_competence_framework.',
      },
      competenceActivity: {
        type: 'string',
        enum: [...ALL_HBOI_ACTIVITIES],
        description:
          'Used when action is "highlight_competence". The HBO-i activity of the competence, exactly as returned by get_student_competences or get_competence_framework.',
      },
    },
  },
};

export type PerformUiActionInput = {
  action:
    | 'open_activities_panel'
    | 'highlight_activity'
    | 'open_competences_panel'
    | 'highlight_competence';
  mode: 'auto' | 'suggest';
  label: string;
  activityId?: string;
  competenceLayer?: HboiLayer;
  competenceActivity?: HboiActivity;
};

@Injectable()
export class PerformUiActionTool {
  execute(): string {
    return JSON.stringify({ ok: true });
  }
}
