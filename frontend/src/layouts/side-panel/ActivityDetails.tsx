import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
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
  const status = statusMeta[activity.status];

  return (
    <Box
      sx={(theme) => ({
        px: 2,
        pt: 1.25,
        pb: 1.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      })}
    >
      <Stack sx={{ minHeight: 260 }} spacing={1.5}>
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

        <Divider />

        <List dense disablePadding>
          <ListItem disableGutters disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <TodayOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText
              primary={`Deadline: ${formatDeadlineLabel(activity.deadline)}`}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>

          <ListItem disableGutters disablePadding>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FlagOutlinedIcon sx={{ fontSize: 18, color: status.color }} />
            </ListItemIcon>
            <ListItemText
              primary={`Status: ${status.label}`}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>

          {activity.competencyLabel ? (
            <ListItem disableGutters disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <SchoolOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={`Gekoppelde competentie: ${activity.competencyLabel}`}
                slotProps={{ primary: { variant: 'body2' } }}
              />
            </ListItem>
          ) : null}
        </List>

        <Button
          sx={{ mt: 'auto' }}
          variant="contained"
          fullWidth
          startIcon={<EditOutlinedIcon />}
          onClick={() => { onEdit(activity); }}
        >
          Bewerken
        </Button>
      </Stack>
    </Box>
  );
}
