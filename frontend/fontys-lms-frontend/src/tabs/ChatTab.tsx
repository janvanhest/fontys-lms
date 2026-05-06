import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useLayout } from '@/context/useLayout'

const messages = [
  {
    id: 'assistant-1',
    role: 'assistant',
    title: 'LMS-assistent',
    content:
      'Ik heb de laatste activiteit en challenge-context geladen. Waar wil je vandaag op sturen?',
  },
  {
    id: 'student-1',
    role: 'student',
    title: 'Student',
    content:
      'Ik wil mijn stappenplan aanscherpen en checken of mijn competenties goed aansluiten op de challenge.',
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    title: 'LMS-assistent',
    content:
      'Prima. Open desgewenst de activiteitenkolom om het recente logboek mee te nemen in dit gesprek.',
  },
] as const

export function ChatTab() {
  const { sidePanelOpen, setSidePanelOpen, activeTab } = useLayout()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {activeTab === 'activities' ? 'Activities' : 'Chat'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Werk gesprek, activiteiten en vervolgstappen vanuit een enkele werkruimte uit.
          </Typography>
        </Box>

        <IconButton
          color={sidePanelOpen ? 'primary' : 'default'}
          onClick={() => {
            setSidePanelOpen(!sidePanelOpen)
          }}
          aria-label="Toggle activities panel"
        >
          <ChecklistRtlIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: { xs: 2, md: 3 },
          py: 3,
        }}
      >
        <Stack spacing={2.5}>
          {messages.map((message) => {
            const isStudent = message.role === 'student'

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1.5,
                  justifyContent: isStudent ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                }}
              >
                {!isStudent ? (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
                    L
                  </Avatar>
                ) : null}

                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: 680,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isStudent ? 'grey.100' : 'background.paper',
                    color: 'text.primary',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 0.75,
                      color: 'text.secondary',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {message.title}
                  </Typography>
                  <Typography variant="body1">{message.content}</Typography>
                </Paper>

                {isStudent ? (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34 }}>
                    S
                  </Avatar>
                ) : null}
              </Box>
            )
          })}
        </Stack>
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Typ je bericht of notitie..."
            size="small"
          />
          <IconButton color="default" aria-label="Add attachment">
            <AddIcon />
          </IconButton>
          <IconButton color="primary" aria-label="Send message">
            <ArrowUpwardIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
