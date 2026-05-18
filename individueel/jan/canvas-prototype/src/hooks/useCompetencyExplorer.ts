import { useMemo, useState } from 'react';

import type {
  CompetencyBadge,
  CompetencyMatrixRow,
  CompetencyOverviewGroup,
} from '../types';

function flattenBadges(
  overviewGroups: CompetencyOverviewGroup[],
  rows: CompetencyMatrixRow[],
): CompetencyBadge[] {
  const overviewBadges = overviewGroups.flatMap((group) => group.items);
  const rowBadges = rows.flatMap((row) =>
    Object.values(row.cells).flatMap((cell) => cell ?? []),
  );

  return [...overviewBadges, ...rowBadges];
}

interface UseCompetencyExplorerResult {
  selectedBadge: CompetencyBadge | null;
  selectBadge: (badge: CompetencyBadge) => void;
}

export function useCompetencyExplorer(
  overviewGroups: CompetencyOverviewGroup[],
  rows: CompetencyMatrixRow[],
): UseCompetencyExplorerResult {
  const allBadges = useMemo(() => flattenBadges(overviewGroups, rows), [overviewGroups, rows]);
  const [selectedId, setSelectedId] = useState<string | null>(allBadges[0]?.id ?? null);

  const selectedBadge =
    allBadges.find((badge) => badge.id === selectedId) ?? allBadges[0] ?? null;

  const selectBadge = (badge: CompetencyBadge) => {
    setSelectedId(badge.id);
  };

  return {
    selectedBadge,
    selectBadge,
  };
}
