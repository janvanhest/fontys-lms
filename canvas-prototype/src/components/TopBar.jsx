import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import { TABS } from '../constants';

export default function TopBar({ sidebarOpen, onToggleSidebar, activeTab, onTabChange, themeMode, onToggleTheme }) {
  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense" sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={onToggleSidebar} size="small">
          <MenuIcon />
        </IconButton>

        <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2, whiteSpace: 'nowrap' }}>
          {themeMode === 'wireframe' ? '[platform naam]' : 'Canvas Prototype'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
          {TABS.map(({ id, label }) => (
            <Button
              key={id}
              size="small"
              onClick={() => onTabChange(id)}
              sx={{
                fontWeight: activeTab === id ? 'bold' : 'normal',
                borderBottom: activeTab === id ? '2px solid currentColor' : '2px solid transparent',
                borderRadius: 0,
                ...(themeMode === 'wireframe' ? {} : {
                  border: 'none',
                  '&:hover': { border: 'none', backgroundColor: 'action.hover' },
                }),
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        <Button size="small" onClick={onToggleTheme}>
          {themeMode === 'wireframe' ? 'Switch to MUI' : 'Switch to Wireframe'}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
