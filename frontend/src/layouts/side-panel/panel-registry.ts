import type { ComponentType } from 'react';
import type { SidePanelContent } from '@/context/layout-context';
import { ActivitiesPanel } from './ActivitiesPanel';
import { CompetencesPanel } from './CompetencesPanel';

export const PANEL_REGISTRY: Record<SidePanelContent['type'], ComponentType> = {
  activities: ActivitiesPanel,
  competences: CompetencesPanel,
};
