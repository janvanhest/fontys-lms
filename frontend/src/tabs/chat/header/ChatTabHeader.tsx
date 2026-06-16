import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { LayoutTab } from '@/context/layout-context';
import type { ChatStatus, ChatStatusIcon } from '@/tabs/chat/messages/chatStreamStatus';

type ChatTabHeaderProps = {
  activeTab: LayoutTab;
  isLoadingHistory: boolean;
  isStreaming: boolean;
  onToggleActivities: () => void;
  onToggleCompetences: () => void;
  activePanel: 'activities' | 'competences' | null;
  status: ChatStatus | null;
};

function getStatusIcon(icon: ChatStatusIcon) {
  switch (icon) {
    case 'activities':
      return <ChecklistRtlIcon fontSize="small" />;
    case 'competences':
      return <SchoolRoundedIcon fontSize="small" />;
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
  onToggleCompetences,
  activePanel,
  status,
}: ChatTabHeaderProps) {
  const activitiesOpen = activePanel === 'activities';
  const competencesOpen = activePanel === 'competences';
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={competencesOpen ? 'Competenties verbergen' : 'Competenties tonen'} arrow>
          <IconButton
            onClick={onToggleCompetences}
            aria-label={competencesOpen ? 'Competenties verbergen' : 'Competenties tonen'}
            aria-pressed={competencesOpen}
            sx={(theme) => ({
              bgcolor: competencesOpen ? theme.palette.primary.main : theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            })}
          >
            <SchoolRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={activitiesOpen ? 'Activiteiten verbergen' : 'Activiteiten tonen'} arrow>
          <IconButton
            onClick={onToggleActivities}
            aria-label={activitiesOpen ? 'Activiteiten verbergen' : 'Activiteiten tonen'}
            aria-pressed={activitiesOpen}
            sx={(theme) => ({
              bgcolor: activitiesOpen ? theme.palette.primary.main : theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            })}
          >
            <ChecklistRtlIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
