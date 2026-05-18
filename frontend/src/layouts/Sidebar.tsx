import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { fetchGesprekken, type GesprekSummary } from '@/api/chat'
import { useLayout } from '@/context/useLayout'

const sidebarWidth = 190

export function Sidebar() {
  const { sidebarOpen } = useLayout()
  const [gesprekken, setGesprekken] = useState<GesprekSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!sidebarOpen) return
    setLoading(true)
    fetchGesprekken()
      .then(setGesprekken)
      .catch(() => setGesprekken([]))
      .finally(() => setLoading(false))
  }, [sidebarOpen])

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
            Nieuw gesprek
          </Button>

          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}
          >
            Gesprekken
          </Typography>

          {loading ? (
            <CircularProgress size={20} sx={{ alignSelf: 'center' }} />
          ) : (
            <List disablePadding sx={{ display: 'grid', gap: 1 }}>
              {gesprekken.map((gesprek) => (
                <ListItemButton
                  key={gesprek.id}
                  selected={gesprek.id === selectedId}
                  onClick={() => setSelectedId(gesprek.id)}
                  sx={{
                    display: 'block',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor:
                      gesprek.id === selectedId ? 'action.selected' : 'transparent',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                    Gesprek
                  </Typography>
                  <Chip
                    size="small"
                    label={new Date(gesprek.aangemaaktOp).toLocaleDateString('nl-NL')}
                    variant="outlined"
                    color="default"
                    sx={{ mt: 1 }}
                  />
                </ListItemButton>
              ))}
              {gesprekken.length === 0 && !loading && (
                <Typography variant="caption" color="text.secondary">
                  Nog geen gesprekken
                </Typography>
              )}
            </List>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
