import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useLayout } from '@/context/useLayout';
import { PANEL_REGISTRY } from '@/layouts/side-panel/panel-registry';
import { panelWidth } from '@/layouts/side-panel/constants';
import { fontysColors } from '@/themes/muiTheme';

export function SidePanel() {
  const { sidePanelOpen, sidePanelContent, openSidePanel } = useLayout();
  const Panel = sidePanelContent ? PANEL_REGISTRY[sidePanelContent.type] : null;

  return (
    <Box sx={{ display: 'flex', flexShrink: 0 }}>
      <Box
        sx={{
          width: sidePanelOpen ? panelWidth : 0,
          minWidth: sidePanelOpen ? panelWidth : 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          borderLeft: sidePanelOpen ? '1px solid' : '0 solid transparent',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            width: panelWidth,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            bgcolor: 'background.paper',
          }}
        >
          {Panel ? <Panel /> : null}
        </Box>
      </Box>

      {!sidePanelOpen && (
        <ButtonBase
          onClick={() => openSidePanel(sidePanelContent ?? { type: 'activities' })}
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
      )}
    </Box>
  );
}
