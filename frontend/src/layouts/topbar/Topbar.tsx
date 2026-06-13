import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Tooltip from '@mui/material/Tooltip';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { studentProfileOptions } from '@/api/student';
import type { LayoutTab } from '@/context/layout-context';
import { useLayout } from '@/context/useLayout';
import { StudentMenu } from './StudentMenu';

const tabOptions: Array<{ label: string; value: LayoutTab }> = [
  { label: 'Chat', value: 'chat' },
  { label: 'Activities', value: 'activities' },
  // { label: 'Challenge', value: 'challenge' },
  { label: 'Competenties', value: 'competenties' },
  // { label: 'Stappenplan', value: 'stappenplan' },
];

export function Topbar() {
  const { activeTab, selectTab, sidebarOpen, setSidebarOpen } = useLayout();
  const { data: student } = useQuery(studentProfileOptions);
  const [flashKey, setFlashKey] = useState(0);
  const prevSidebarOpenRef = useRef(sidebarOpen);

  useEffect(() => {
    if (prevSidebarOpenRef.current && !sidebarOpen) {
      setFlashKey((k) => k + 1);
    }
    prevSidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  return (
    <AppBar position="static" elevation={2} sx={{ position: 'relative', zIndex: 1 }}>
      <Toolbar
        sx={{
          gap: 2,
          alignItems: 'center',
          minHeight: { xs: 72, md: 80 },
          px: { xs: 2, md: 3 },
        }}
      >
        <Tooltip title={sidebarOpen ? 'Gesprekken verbergen' : 'Gesprekken tonen'} arrow>
          <IconButton
          key={flashKey}
          aria-label="Toggle sidebar"
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
          }}
          edge="start"
          sx={{
            color: 'common.white',
            ...(flashKey > 0 && {
              animation: 'sidebarHint 0.5s ease-out 3',
              '@keyframes sidebarHint': {
                '0%': { backgroundColor: 'transparent' },
                '25%': { backgroundColor: 'rgba(255,255,255,0.35)' },
                '100%': { backgroundColor: 'transparent' },
              },
            }),
          }}
        >
          <MenuOpenIcon sx={{ transform: sidebarOpen ? 'none' : 'scaleX(-1)', transition: 'transform 0.2s' }} />
        </IconButton>
        </Tooltip>

        <Typography
          variant="h6"
          component="div"
          sx={{
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            color: 'common.white',
          }}
        >
          Fontys LMS
        </Typography>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_event, value: LayoutTab) => {
              selectTab(value);
            }}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 56,
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: 'common.white',
              },
              '& .MuiTab-root': {
                minHeight: 56,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.72)',
              },
              '& .MuiTab-root:hover': {
                color: 'common.white',
              },
              '& .MuiTab-root.Mui-selected': {
                color: 'common.white',
              },
            }}
          >
            {tabOptions.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <StudentMenu student={student} />
      </Toolbar>
    </AppBar>
  );
}
