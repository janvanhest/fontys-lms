import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { fontysColors } from '@/themes/muiTheme';

type SidePanelEdgeTabProps = {
  onClick: () => void;
};

export function SidePanelEdgeTab({ onClick }: SidePanelEdgeTabProps) {
  return (
    <ButtonBase
      focusRipple
      onClick={onClick}
      aria-label="Open activiteiten"
      sx={{
        width: 20,
        flexShrink: 0,
        bgcolor: fontysColors.paars[50],
        borderLeft: `2px solid ${fontysColors.paars[200]}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 2,
        '&:hover': {
          bgcolor: fontysColors.paars[300],
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          color: fontysColors.paars.main,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        ☰ Activiteiten
      </Typography>
    </ButtonBase>
  );
}
