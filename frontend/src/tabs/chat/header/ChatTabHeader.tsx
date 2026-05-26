import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { LayoutTab } from '@/context/layout-context';
import type { ChatStatus, ChatStatusIcon } from '@/tabs/chat/messages/chatStreamHelpers';

type ChatTabHeaderProps = {
  activeTab: LayoutTab;
  isLoadingHistory: boolean;
  isStreaming: boolean;
  onToggleActivities: () => void;
  sidePanelOpen: boolean;
  status: ChatStatus | null;
};

function getStatusIcon(icon: ChatStatusIcon) {
  switch (icon) {
    case 'activities':
      return <ChecklistRtlIcon fontSize="small" />;
    case 'sources':
      return <AutoStoriesRoundedIcon fontSize="small" />;
    case 'panel':
      return <DescriptionRoundedIcon fontSize="small" />;
    case 'writing':
      return <EditNoteRoundedIcon fontSize="small" />;
    case 'history':
      return <HistoryRoundedIcon fontSize="small" />;
    case 'thinking':
      return <PsychologyRoundedIcon fontSize="small" />;
    case 'tool':
      return <HandymanRoundedIcon fontSize="small" />;
    case 'spark':
    default:
      return <AutoAwesomeRoundedIcon fontSize="small" />;
  }
}

export function ChatTabHeader({
  activeTab,
  isLoadingHistory,
  isStreaming,
  onToggleActivities,
  sidePanelOpen,
  status,
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
          {activeTab === 'activities' ? 'Activiteiten' : 'Chat'}
        </Typography>
        {status || isStreaming || isLoadingHistory ? (
          <Chip
            icon={getStatusIcon(status?.icon ?? (isLoadingHistory ? 'history' : 'writing'))}
            label={
              status?.label ?? (isLoadingHistory ? 'Gesprek laden...' : 'Antwoord schrijven...')
            }
            size="small"
            sx={{
              mt: 1,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              color: 'text.secondary',
              '& .MuiChip-icon': {
                color: 'primary.main',
              },
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Stel een vraag over je challenge, activiteiten of cursusinhoud.
          </Typography>
        )}
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
