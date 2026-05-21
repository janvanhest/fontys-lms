import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Activity } from '@/types/activity';
import { formatDeadlineLabel } from '@/utils/activity-grouping';
import { getTypeLabel, statusMeta } from './constants';

type ActivityDetailsProps = {
  activity: Activity;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
};

export function ActivityDetails({ activity, onClose, onEdit }: ActivityDetailsProps) {
  return (
    <Box
      sx={{
        px: 2,
        pt: 1.25,
        pb: 1.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha('#1976d2', 0.015),
      }}
    >
      <Box sx={{ minHeight: 260, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Chip label={getTypeLabel(activity.type)} color="primary" size="small" />
          <IconButton
            size="small"
            aria-label="Sluit detailweergave"
            onClick={() => { onClose(); }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {activity.title}
        </Typography>

        {activity.description ? (
          <Typography variant="body2" color="text.secondary">
            {activity.description}
          </Typography>
        ) : null}

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TodayOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2">
              Deadline: {formatDeadlineLabel(activity.deadline)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagOutlinedIcon sx={{ fontSize: 18, color: statusMeta[activity.status].color }} />
            <Typography variant="body2">
              Status: {statusMeta[activity.status].label}
            </Typography>
          </Box>

          {activity.competencyLabel ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">
                Gekoppelde competentie: {activity.competencyLabel}
              </Typography>
            </Box>
          ) : null}
        </Stack>

        <Button
          sx={{ mt: 'auto' }}
          variant="contained"
          fullWidth
          startIcon={<EditOutlinedIcon />}
          onClick={() => { onEdit(activity); }}
        >
          Bewerken
        </Button>
      </Box>
    </Box>
  );
}
