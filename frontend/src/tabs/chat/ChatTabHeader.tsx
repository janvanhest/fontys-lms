import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { LayoutTab } from '@/context/layout-context';

type ChatTabHeaderProps = {
  activeTab: LayoutTab;
  isLoadingHistory: boolean;
  onToggleActivities: () => void;
  sidePanelOpen: boolean;
  statusText: string | null;
};

export function ChatTabHeader({
  activeTab,
  isLoadingHistory,
  onToggleActivities,
  sidePanelOpen,
  statusText,
}: ChatTabHeaderProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box>
        <Typography variant="h4" component="h1">
          {activeTab === 'activities' ? 'Activities' : 'Chat'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {statusText ??
            (isLoadingHistory
              ? 'Gesprek laden...'
              : 'Stel een vraag over je challenge, activiteiten of cursusinhoud.')}
        </Typography>
      </Box>

      <IconButton
        color={sidePanelOpen ? 'primary' : 'default'}
        onClick={onToggleActivities}
        aria-label="Toggle activities panel"
      >
        <ChecklistRtlIcon />
      </IconButton>
    </Box>
  );
}
