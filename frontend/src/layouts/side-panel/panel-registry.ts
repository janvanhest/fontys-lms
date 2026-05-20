import type { ComponentType } from 'react';
import { ActivitiesPanel } from './ActivitiesPanel';

export const PANEL_REGISTRY: Record<string, ComponentType> = {
  activities: ActivitiesPanel,
};
