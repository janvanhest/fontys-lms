import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Timeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import { useLayout } from '@/context/useLayout'

const panelWidth = 320

const activityGroups = [
  {
    label: 'Vandaag',
    items: [
      {
        time: '09:10',
        title: 'Coach note toegevoegd',
        description: 'Feedback op studievoortgang en vervolgstap voor reflectie.',
      },
      {
        time: '11:45',
        title: 'Nieuwe challenge gekoppeld',
        description: 'Challenge sprint staat klaar voor bespreking in het gesprek.',
      },
    ],
  },
  {
    label: 'Gisteren',
    items: [
      {
        time: '15:20',
        title: 'Competentie-update',
        description: 'Communicatie en analyse gemarkeerd als aandachtspunt.',
      },
    ],
  },
]

export function SidePanel() {
  const { sidePanelOpen } = useLayout()

  return (
    <Box
      sx={{
        width: sidePanelOpen ? panelWidth : 0,
        flexShrink: 0,
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
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Activiteiten</Typography>
          <Typography variant="body2" color="text.secondary">
            Tijdlijn van recente acties rond deze student.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
          <Stack spacing={2}>
            {activityGroups.map((group) => (
              <Box key={group.label}>
                <Divider sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ letterSpacing: '0.08em' }}>
                    {group.label}
                  </Typography>
                </Divider>

                <Timeline
                  sx={{
                    m: 0,
                    p: 0,
                    [`& .MuiTimelineItem-root:before`]: {
                      flex: 0,
                      padding: 0,
                    },
                  }}
                >
                  {group.items.map((activity, index) => (
                    <TimelineItem key={`${group.label}-${activity.time}`}>
                      <TimelineOppositeContent
                        sx={{
                          flex: 0.22,
                          px: 0.5,
                          pt: 1.5,
                          color: 'text.secondary',
                          fontSize: 12,
                        }}
                      >
                        {activity.time}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={index === 0 ? 'primary' : 'grey'} />
                        {index < group.items.length - 1 ? <TimelineConnector /> : null}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: 0.5, pr: 0.5 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button fullWidth variant="contained" startIcon={<AddIcon />}>
            Nieuwe activiteit
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
