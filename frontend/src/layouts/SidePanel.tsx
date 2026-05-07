import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayout } from '@/context/useLayout'
import { ActivityDetails } from '@/layouts/side-panel/ActivityDetails'
import { ActivityMenus } from '@/layouts/side-panel/ActivityMenus'
import { ActivityTimeline } from '@/layouts/side-panel/ActivityTimeline'
import {
  groupMeta,
  groupOrder,
  initialActivities,
  panelWidth,
} from '@/layouts/side-panel/constants'
import type {
  ActivityGroupSection,
  ActivityItem,
  ActivityStatus,
  ActivityType,
  OpenSubmenu,
} from '@/layouts/side-panel/types'

type SidePanelProps = {
  initialActivityItems?: ActivityItem[]
  initialSelectedActivityId?: string | null
}

export function SidePanel({
  initialActivityItems = initialActivities,
  initialSelectedActivityId = null,
}: SidePanelProps = {}) {
  const { sidePanelOpen } = useLayout()
  const [activities, setActivities] = useState(initialActivityItems)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    initialSelectedActivityId,
  )
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuActivityId, setMenuActivityId] = useState<string | null>(null)
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null)

  const selectedActivity =
    activities.find((activity) => activity.id === selectedActivityId) ?? null

  const groupedActivities = useMemo(
    () =>
      groupOrder
        .map((groupKey) => ({
          groupKey,
          ...groupMeta[groupKey],
          items: activities.filter((activity) => activity.groupKey === groupKey),
        }))
        .filter((group) => group.items.length > 0),
    [activities],
  ) as ActivityGroupSection[]

  const closeMenus = () => {
    setMenuAnchorEl(null)
    setMenuActivityId(null)
    setSubmenuAnchorEl(null)
    setOpenSubmenu(null)
  }

  const handleOpenMenu = (
    event: MouseEvent<HTMLButtonElement>,
    activityId: string,
  ) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setMenuActivityId(activityId)
    setSubmenuAnchorEl(null)
    setOpenSubmenu(null)
  }

  const handleOpenSubmenu = (
    event: MouseEvent<HTMLElement>,
    submenu: Exclude<OpenSubmenu, null>,
  ) => {
    event.stopPropagation()
    setSubmenuAnchorEl(event.currentTarget)
    setOpenSubmenu(submenu)
  }

  const updateActivity = (activityId: string, updater: (activity: ActivityItem) => ActivityItem) => {
    setActivities((currentActivities) =>
      currentActivities.map((activity) =>
        activity.id === activityId ? updater(activity) : activity,
      ),
    )
  }

  const handleStatusChange = (status: ActivityStatus) => {
    if (!menuActivityId) {
      return
    }

    updateActivity(menuActivityId, (activity) => ({
      ...activity,
      status,
    }))
    closeMenus()
  }

  const handleTypeChange = (nextType: ActivityType) => {
    if (!menuActivityId) {
      return
    }

    updateActivity(menuActivityId, (activity) => ({
      ...activity,
      type: nextType,
    }))
    closeMenus()
  }

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivityId(activityId)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, activityId: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    if ((event.target as HTMLElement).closest('button,[role="button"]')) {
      return
    }
    event.preventDefault()
    handleSelectActivity(activityId)
  }

  const closeSubmenu = () => {
    setSubmenuAnchorEl(null)
    setOpenSubmenu(null)
  }

  return (
    <Box
      sx={{
        width: sidePanelOpen ? panelWidth : 0,
        minWidth: sidePanelOpen ? panelWidth : 0,
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
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Activiteiten</Typography>
          <Typography variant="body2" color="text.secondary">
            Tijdlijn van activiteiten en deadlines rond deze student.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
          <Stack spacing={2}>
            <ActivityTimeline
              groups={groupedActivities}
              selectedActivityId={selectedActivityId}
              menuActivityId={menuActivityId}
              menuAnchorEl={menuAnchorEl}
              onSelectActivity={handleSelectActivity}
              onCardKeyDown={handleCardKeyDown}
              onOpenMenu={handleOpenMenu}
            />
          </Stack>
        </Box>

        <Collapse in={!!selectedActivity} timeout="auto" unmountOnExit>
          {selectedActivity ? (
            <ActivityDetails
              activity={selectedActivity}
              onClose={() => setSelectedActivityId(null)}
            />
          ) : null}
        </Collapse>

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

      <ActivityMenus
        activities={activities}
        menuActivityId={menuActivityId}
        menuAnchorEl={menuAnchorEl}
        submenuAnchorEl={submenuAnchorEl}
        openSubmenu={openSubmenu}
        onCloseMenus={closeMenus}
        onOpenSubmenu={handleOpenSubmenu}
        onCloseSubmenu={closeSubmenu}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
      />
    </Box>
  )
}
