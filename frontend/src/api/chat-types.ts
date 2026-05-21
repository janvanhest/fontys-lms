export type ConversationSummary = {
  id: string;
  studentId: string;
  createdAt: string;
  title?: string;
};

export type ChatSource = {
  kind: string;
  label: string;
  url: string | null;
};

export type ConversationMessage = {
  id: string;
  role: 'student' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
};

export type ConversationDetails = {
  id: string;
  studentId: string;
  createdAt: string;
  title?: string;
  messages: ConversationMessage[];
};

export type ChatSseEvent = {
  event: 'status' | 'tool_call' | 'tool_result' | 'final' | 'error';
  data: string;
};

export type FinalChatPayload = {
  text: string;
  conversationId?: string;
  sources?: ChatSource[];
};

export type UiChatMessage = {
  id: string;
  role: 'student' | 'assistant';
  content: string;
  sources?: ChatSource[];
};
