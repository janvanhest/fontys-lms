import type { ChatHistoryItem, Message, TabItem } from './types';

export const INITIAL_MESSAGES: Message[] = [
  { id: 'msg-1', role: 'assistant', text: '[welkomstbericht / openingsvraag]' },
  { id: 'msg-2', role: 'user', text: '[vraag van student]' },
  { id: 'msg-3', role: 'assistant', text: '[antwoord — tekst / link / activiteit]' },
];

export const INITIAL_HISTORY: ChatHistoryItem[] = [
  { id: 'chat-1', title: '[chat titel]' },
  { id: 'chat-2', title: '[chat titel]' },
  { id: 'chat-3', title: '[chat titel]' },
];

export const STATIC_RESPONSE =
  '[dit is een papieren prototype — hier zou een antwoord verschijnen]';

export const TABS: TabItem[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'activities', label: 'Activities' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'competencies', label: 'Competenties' },
  { id: 'study-plan', label: 'Stappenplan' },
];
