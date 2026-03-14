export type ThemeMode = 'wireframe' | 'mui';

export type AppTab = 'chat' | 'activities' | 'learning';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
}

export interface TabItem {
  id: AppTab;
  label: string;
}

export type ActivityStatusKey = 'open' | 'bezig' | 'feedback' | 'afgerond';

export interface Activity {
  id: string;
  tag: string;
  title: string;
  deadline: string;
  status: string;
  description: string;
  competentie: string;
  actieLabel: string;
  statusKey?: ActivityStatusKey;
}

export interface ActivityGroup {
  id: string;
  label: string;
  date: string;
  activities: Activity[];
}

export type CardStatusMap = Record<string, ActivityStatusKey>;

export type ActivityMenu = 'main' | 'type' | 'status';

export type TimelineDotVariant = 'group' | 'card';
