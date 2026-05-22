export type SidebarConversationTitleInput = {
  createdAt: string;
  title?: string;
};

function parseConversationDate(createdAt: string): Date | null {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatConversationDateLabel(createdAt: string): string {
  const date = parseConversationDate(createdAt);
  if (date === null) return 'Onbekende datum';

  return date.toLocaleDateString('nl-NL');
}

export function formatConversationTimestampLabel(createdAt: string): string {
  const date = parseConversationDate(createdAt);
  if (date === null) return 'Onbekende datum';

  return date.toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function formatConversationTitle(conversation: SidebarConversationTitleInput): string {
  if (conversation.title && conversation.title.trim().length > 0) {
    return conversation.title;
  }

  return formatConversationTimestampLabel(conversation.createdAt);
}

export function normalizeConversationTitleInput(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
