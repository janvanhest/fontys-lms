import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { competenceFrameworkQueryOptions, competencesQueryOptions } from '@/api/competences';
import { buildLayerGroups, cellKey, type CompetenceItem } from './competenceModel';
import { CompetenceLayerCard } from './CompetenceLayerCard';
import { CompetenceDetailPanel } from './CompetenceDetailPanel';

export function CompetenceOverview() {
  const frameworkQuery = useQuery(competenceFrameworkQueryOptions);
  const progressQuery = useQuery(competencesQueryOptions);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (frameworkQuery.isLoading || progressQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (frameworkQuery.isError || !frameworkQuery.data) {
    return (
      <Typography color="error">
        Kon het competentieraamwerk niet laden. Probeer later opnieuw.
      </Typography>
    );
  }

  const groups = buildLayerGroups(frameworkQuery.data, progressQuery.data ?? []);
  const allItems = groups.flatMap((group) => group.items);
  const selectedItem: CompetenceItem | null =
    allItems.find((item) => cellKey(item.layer, item.activity) === selectedKey) ?? null;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
        alignItems: 'start',
      }}
    >
      <Stack spacing={2}>
        {groups.map((group) => (
          <CompetenceLayerCard
            key={group.layer}
            group={group}
            selectedKey={selectedKey}
            onSelect={(item) => {
              setSelectedKey(cellKey(item.layer, item.activity));
            }}
          />
        ))}
      </Stack>

      <CompetenceDetailPanel key={selectedKey ?? 'none'} item={selectedItem} />
    </Box>
  );
}
