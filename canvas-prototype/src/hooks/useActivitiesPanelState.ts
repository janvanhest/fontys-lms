import { useState } from 'react';

import type { Activity, ActivityGroup, ActivityStatusKey, CardStatusMap } from '../types';

function buildInitialStatuses(groups: ActivityGroup[]): CardStatusMap {
  const map: CardStatusMap = {};

  for (const group of groups) {
    for (const activity of group.activities) {
      map[activity.id] = activity.statusKey ?? 'open';
    }
  }

  return map;
}

interface UseActivitiesPanelStateResult {
  cardStatuses: CardStatusMap;
  selectedActivity: Activity | null;
  selectedId: string | null;
  handleCardClick: (id: string) => void;
  clearSelection: () => void;
  handleStatusChange: (id: string, status: ActivityStatusKey) => void;
}

export function useActivitiesPanelState(
  groups: ActivityGroup[],
): UseActivitiesPanelStateResult {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardStatuses, setCardStatuses] = useState<CardStatusMap>(() =>
    buildInitialStatuses(groups),
  );

  const handleStatusChange = (id: string, status: ActivityStatusKey) => {
    setCardStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const handleCardClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const clearSelection = () => {
    setSelectedId(null);
  };

  const selectedActivity =
    groups.flatMap((group) => group.activities).find((activity) => activity.id === selectedId) ??
    null;

  return {
    cardStatuses,
    selectedActivity,
    selectedId,
    handleCardClick,
    clearSelection,
    handleStatusChange,
  };
}
