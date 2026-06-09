export type ToolCallName =
  | 'search_activities'
  | 'get_student_context'
  | 'search_course_content'
  | 'get_student_competences'
  | 'get_competence_framework';

export type ToolCallBubble = { name: ToolCallName; label: string; icon: string };

export type ChatStatusIcon =
  | 'activities'
  | 'competences'
  | 'sources'
  | 'panel'
  | 'spark'
  | 'writing'
  | 'history'
  | 'thinking'
  | 'tool';

export type ChatStatus = { label: string; icon: ChatStatusIcon };

export const CHAT_HISTORY_STATUS: ChatStatus = {
  label: 'Gesprek laden...',
  icon: 'history',
};

export const CHAT_WRITING_STATUS: ChatStatus = {
  label: 'Antwoord voorbereiden...',
  icon: 'writing',
};

export function toolCallToBubble(name: string): ToolCallBubble | null {
  const bubbles: Record<ToolCallName, ToolCallBubble> = {
    search_activities: {
      name: 'search_activities',
      label: 'Activiteiten bekeken',
      icon: 'activities',
    },
    get_student_context: {
      name: 'get_student_context',
      label: 'Studentprofiel bekeken',
      icon: 'student',
    },
    search_course_content: {
      name: 'search_course_content',
      label: 'Bronnen bekeken',
      icon: 'sources',
    },
    get_student_competences: {
      name: 'get_student_competences',
      label: 'Competenties bekeken',
      icon: 'competences',
    },
    get_competence_framework: {
      name: 'get_competence_framework',
      label: 'Raamwerk bekeken',
      icon: 'competences',
    },
  };
  return name in bubbles ? bubbles[name as ToolCallName] : null;
}

export function getStatusFromToolCall(data: string): ChatStatus {
  try {
    const payload = JSON.parse(data) as { name?: string };
    if (payload.name === 'search_activities') {
      return { label: 'Activiteiten bekijken...', icon: 'activities' };
    }
    if (payload.name === 'search_course_content') {
      return { label: 'Bronnen bekijken...', icon: 'sources' };
    }
    if (payload.name === 'perform_ui_action') {
      return { label: 'Paneel openen...', icon: 'panel' };
    }
    if (payload.name === 'get_student_competences' || payload.name === 'get_competence_framework') {
      return { label: 'Competenties bekijken...', icon: 'competences' };
    }

    return { label: 'Extra context ophalen...', icon: 'tool' };
  } catch {
    return { label: 'Bronnen bekijken...', icon: 'sources' };
  }
}

export function getStatusFromEventText(text: string): ChatStatus {
  if (text === 'Nadenken...') {
    return { label: text, icon: 'thinking' };
  }

  if (text === 'Tool uitvoeren...') {
    return { label: text, icon: 'tool' };
  }

  return { label: text, icon: 'spark' };
}
