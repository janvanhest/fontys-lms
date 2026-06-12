import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useLayout } from '@/context/useLayout';

export function ActivitiesPanelHeader() {
  const { closeSidePanel } = useLayout();

  return (
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
        <Typography variant="h6">Activiteiten</Typography>
        <Typography variant="body2" color="text.secondary">
          Tijdlijn van activiteiten en deadlines.
        </Typography>
      </Box>
      <IconButton
        size="small"
        edge="end"
        onClick={closeSidePanel}
        aria-label="Sluit activiteiten"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
