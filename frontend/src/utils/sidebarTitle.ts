export type SidebarConversationTitleInput = {
  createdAt: string;
  title?: string;
};

export function formatConversationTitle(conversation: SidebarConversationTitleInput): string {
  if (conversation.title && conversation.title.trim().length > 0) {
    return conversation.title;
  }

  return new Date(conversation.createdAt).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function normalizeConversationTitleInput(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
