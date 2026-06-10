import Box from '@mui/material/Box';
import type { CompetenceCell, CompetenceProgress } from '@/api/competences';

// Voortgangsbalk per competentie: groen gevuld tot het behaalde niveau, een
// gele markering op het doelniveau, de rest leeg.
export function CompetenceLevelBar({
  cell,
  progress,
}: {
  cell: CompetenceCell;
  progress?: CompetenceProgress;
}) {
  const levels: number[] = [];
  for (let level = cell.minLevel; level <= cell.maxLevel; level++) levels.push(level);

  const achieved = progress?.achievedLevel ?? 0;
  const target = progress?.targetLevel ?? null;

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {levels.map((level) => {
        const filled = level <= achieved;
        const isTarget = level === target;
        return (
          <Box
            key={level}
            title={`Niveau ${String(level)}`}
            sx={{
              width: 28,
              height: 10,
              borderRadius: 5,
              border: '1.5px solid',
              borderColor: isTarget ? 'warning.main' : filled ? 'success.main' : 'divider',
              bgcolor: filled ? 'success.main' : isTarget ? 'warning.light' : 'transparent',
            }}
          />
        );
      })}
    </Box>
  );
}
