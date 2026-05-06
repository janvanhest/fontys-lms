import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayout } from '@/context/useLayout'

const conversations = [
  { id: 'current', title: 'Nieuwe intake', status: 'Actief', selected: true },
  { id: 'competence', title: 'Competentiecheck', status: 'Opgeslagen' },
  { id: 'challenge', title: 'Challenge prep', status: 'Concept' },
]

const sidebarWidth = 190

export function Sidebar() {
  const { sidebarOpen } = useLayout()

  return (
    <Box
      sx={{
        width: sidebarOpen ? sidebarWidth : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderRight: sidebarOpen ? '1px solid' : '0 solid transparent',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: sidebarWidth,
          height: '100%',
          p: 2,
        }}
      >
        <Stack spacing={2}>
          <Button fullWidth variant="contained" startIcon={<AddIcon />}>
            New chat
          </Button>

          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}
          >
            Gesprekken
          </Typography>

          <List disablePadding sx={{ display: 'grid', gap: 1 }}>
            {conversations.map((conversation) => (
              <ListItemButton
                key={conversation.id}
                selected={conversation.selected}
                sx={{
                  display: 'block',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: conversation.selected ? 'action.selected' : 'transparent',
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                  {conversation.title}
                </Typography>
                <Chip
                  size="small"
                  label={conversation.status}
                  variant="outlined"
                  color="default"
                  sx={{ mt: 1 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Stack>
      </Box>
    </Box>
  )
}
