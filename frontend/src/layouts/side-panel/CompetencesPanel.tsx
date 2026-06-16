import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { competenceFrameworkQueryOptions, competencesQueryOptions } from '@/api/competences';
import { useLayout } from '@/context/useLayout';
import {
  buildLayerGroups,
  cellKey,
  type CompetenceItem,
} from '@/tabs/competenties/competenceModel';
import { CompetenceLayerCard } from '@/tabs/competenties/CompetenceLayerCard';
import { CompetenceDetailPanel } from '@/tabs/competenties/CompetenceDetailPanel';

export function CompetencesPanel() {
  const { closeSidePanel } = useLayout();
  const frameworkQuery = useQuery(competenceFrameworkQueryOptions);
  const progressQuery = useQuery(competencesQueryOptions);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const groups = frameworkQuery.data
    ? buildLayerGroups(frameworkQuery.data, progressQuery.data ?? [])
    : [];
  const selectedItem: CompetenceItem | null =
    groups
      .flatMap((group) => group.items)
      .find((item) => cellKey(item.layer, item.activity) === selectedKey) ?? null;

  return (
    <>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6">Competenties</Typography>
          <Typography variant="body2" color="text.secondary">
            Je voortgang per HBO-i laag en activiteit.
          </Typography>
        </Box>
        <IconButton
          size="small"
          edge="end"
          onClick={closeSidePanel}
          aria-label="Sluit competenties"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        {frameworkQuery.isLoading || progressQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : frameworkQuery.isError || !frameworkQuery.data ? (
          <Typography color="error">
            Kon het competentieraamwerk niet laden. Probeer later opnieuw.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {groups.map((group) => (
              <CompetenceLayerCard
                key={group.layer}
                group={group}
                selectedKey={selectedKey}
                compact
                onSelect={(item) => {
                  const key = cellKey(item.layer, item.activity);
                  setSelectedKey((prev) => (prev === key ? null : key));
                }}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Collapse in={!!selectedItem} timeout="auto" unmountOnExit>
        {selectedItem ? (
          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <CompetenceDetailPanel
              item={selectedItem}
              onClose={() => {
                setSelectedKey(null);
              }}
            />
          </Box>
        ) : null}
      </Collapse>
    </>
  );
}
