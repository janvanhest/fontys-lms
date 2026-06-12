import Box from '@mui/material/Box';
import { useLayout } from '@/context/useLayout';
import { PANEL_REGISTRY } from '@/layouts/side-panel/panel-registry';
import { SidePanelEdgeTab } from '@/layouts/side-panel/SidePanelEdgeTab';
import { panelWidth } from '@/layouts/side-panel/constants';

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
        <SidePanelEdgeTab
          onClick={() => { openSidePanel(sidePanelContent ?? { type: 'activities' }); }}
        />
      )}
    </Box>
  );
}
