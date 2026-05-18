import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studentInitials, studentProfileOptions } from '@/api/student'
import { useLayout } from '@/context/useLayout'
import { useChatStream } from '@/hooks/useChatStream'

type ChatTabProps = {
  conversationId?: string
}

export function ChatTab({ conversationId }: ChatTabProps = {}) {
  const { sidePanelOpen, setSidePanelOpen, activeTab } = useLayout()
  const { messages, isStreaming, statusText, sendMessage } = useChatStream(conversationId)
  const { data: student } = useQuery(studentProfileOptions)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, statusText])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    await sendMessage(trimmed)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

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
            {statusText ?? 'Stel een vraag over je challenge, activiteiten of cursusinhoud.'}
          </Typography>
        </Box>

        <IconButton
          color={sidePanelOpen ? 'primary' : 'default'}
          onClick={() => setSidePanelOpen(!sidePanelOpen)}
          aria-label="Toggle activities panel"
        >
          <ChecklistRtlIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
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
                {!isStudent && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>L</Avatar>
                )}
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
                  {message.isStreaming ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  )}
                </Paper>
                {isStudent && (
                  <Avatar
                    src={student?.avatarUrl ?? undefined}
                    alt={student?.displayName}
                    sx={{ bgcolor: 'secondary.main', width: 34, height: 34 }}
                  >
                    {student ? studentInitials(student.displayName) : 'S'}
                  </Avatar>
                )}
              </Box>
            )
          })}
          <div ref={bottomRef} />
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
            placeholder="Typ je vraag..."
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <IconButton
            color="primary"
            aria-label="Send message"
            onClick={() => void handleSend()}
            disabled={isStreaming || !input.trim()}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
