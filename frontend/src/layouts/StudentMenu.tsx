import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { studentInitials, type StudentProfile } from '@/api/student'

interface Props {
  student: StudentProfile | undefined
}

export function StudentMenu({ student }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  const initials = student ? studentInitials(student.displayName) : '?'

  return (
    <>
      <IconButton
        onClick={(e) => {
          setAnchor(e.currentTarget)
        }}
        aria-label="Studentprofiel"
        sx={{ p: 0.5 }}
      >
        <Avatar
          src={student?.avatarUrl ?? undefined}
          alt={student?.displayName}
          sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.dark' }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => {
          setAnchor(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" noWrap>
            {student?.displayName ?? '...'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {student?.email ?? ''}
          </Typography>
        </Box>
        <Divider />
        <MenuItem disabled>
          <ListItemText>Uitloggen</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
