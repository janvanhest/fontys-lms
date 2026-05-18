export type ThemeMode = 'wireframe' | 'mui';

export type AppTab =
  | 'chat'
  | 'activities'
  | 'challenge'
  | 'competencies'
  | 'study-plan';

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

export type CompetencyColumnId =
  | 'analysis'
  | 'advise'
  | 'design'
  | 'realisation'
  | 'manage-control';

export type CompetencyBadgeState = 'mastered' | 'active' | 'available';

export interface CompetencyBadge {
  id: string;
  label: string;
  title: string;
  domain: string;
  columnId: CompetencyColumnId;
  descriptionEn: string;
  descriptionNl: string;
  state: CompetencyBadgeState;
}

export interface CompetencyOverviewGroup {
  id: string;
  title: string;
  items: CompetencyBadge[];
}

export interface CompetencyMatrixRow {
  id: string;
  title: string;
  accentColor: string;
  cells: Partial<Record<CompetencyColumnId, CompetencyBadge[]>>;
}
