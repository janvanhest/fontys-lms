import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

type SidePanelEdgeTabProps = {
  onClick: () => void;
};

export function SidePanelEdgeTab({ onClick }: SidePanelEdgeTabProps) {
  return (
    <ButtonBase
      focusRipple
      onClick={onClick}
      aria-label="Open activiteiten"
      sx={(theme) => ({
        width: 20,
        flexShrink: 0,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.30)}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 2,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.20),
        },
      })}
    >
      <Typography
        variant="caption"
        sx={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          color: 'primary.main',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        Activiteiten
      </Typography>
    </ButtonBase>
  );
}
