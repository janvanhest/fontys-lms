import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

type SidePanelEdgeTabProps = {
  onClick: () => void;
  label: string;
  ariaLabel: string;
};

export function SidePanelEdgeTab({ onClick, label, ariaLabel }: SidePanelEdgeTabProps) {
  return (
    <ButtonBase
      focusRipple
      onClick={onClick}
      aria-label={ariaLabel}
      sx={(theme) => ({
        width: 20,
        flex: 1,
        minHeight: 0,
        flexShrink: 0,
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 2,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.2),
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
        {label}
      </Typography>
    </ButtonBase>
  );
}
