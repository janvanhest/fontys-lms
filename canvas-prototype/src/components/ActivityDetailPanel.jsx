import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import SchoolIcon from '@mui/icons-material/School';
import { alpha, useTheme } from '@mui/material/styles';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';

function DetailRow({ icon, children }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {children}
      </Typography>
    </Stack>
  );
}

export default function ActivityDetailPanel({ activity, onClose }) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const primary = theme.palette.primary.main;

  const iconSx = { fontSize: 13 };

  return (
    <Collapse in={!!activity} unmountOnExit>
      <Box
        sx={{
          borderTop: isWireframe
            ? `2px dashed ${theme.palette.text.secondary}`
            : `2px solid ${primary}`,
          backgroundColor: isWireframe
            ? theme.palette.background.paper
            : alpha(primary, 0.03),
          display: 'flex',
          flexDirection: 'column',
          height: 260,
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Chip
            label={activity?.tag}
            size="small"
            variant={isWireframe ? 'outlined' : 'filled'}
            sx={{
              flex: 1,
              height: 20,
              fontSize: 10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              justifyContent: 'flex-start',
              ...(isWireframe ? {} : {
                backgroundColor: alpha(primary, 0.12),
                color: primary,
                fontWeight: 'bold',
                border: 'none',
              }),
            }}
          />
          <IconButton size="small" onClick={onClose} aria-label="Sluit detail" sx={{ ml: 1, color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, lineHeight: 1.35 }}>
            {activity?.title}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 1.5,
              lineHeight: 1.5,
              fontStyle: isWireframe ? 'italic' : 'normal',
            }}
          >
            {activity?.description}
          </Typography>

          <Stack spacing={0.75} sx={{ mb: 1.5 }}>
            <DetailRow icon={<CalendarTodayIcon sx={iconSx} />}>
              deadline: <strong>{activity?.deadline}</strong>
            </DetailRow>
            <DetailRow icon={<FlagIcon sx={iconSx} />}>
              status: <strong>{activity?.status}</strong>
            </DetailRow>
            <DetailRow icon={<SchoolIcon sx={iconSx} />}>
              {activity?.competentie}
            </DetailRow>
          </Stack>

          <Button
            size="small"
            fullWidth
            variant={isWireframe ? 'outlined' : 'contained'}
            disableElevation
          >
            {activity?.actieLabel}
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
}
