import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

export default function Sidebar({ open, onNewChat, history, activeChat, onSelectChat }) {
  return (
    <Box
      sx={{
        width: open ? '190px' : '0px',
        minWidth: open ? '190px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <Box sx={{ p: 1 }}>
        <Button fullWidth size="small" onClick={onNewChat}>
          + New chat
        </Button>
      </Box>
      <Divider />
      <Typography variant="caption" sx={{ px: 1.5, pt: 1, color: 'text.secondary', display: 'block' }}>
        Recent
      </Typography>
      <List dense sx={{ flex: 1, overflow: 'auto' }}>
        {history.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeChat === item.id}
            onClick={() => onSelectChat(item.id)}
            sx={{ fontWeight: activeChat === item.id ? 'bold' : 'normal' }}
          >
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{ noWrap: true, fontSize: 12 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
