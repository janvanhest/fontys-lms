import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { studentInitials, type StudentProfile } from '@/api/student';
import { useAppTheme, type ThemeName } from '@/themes/ThemeContext';
import { useLanguage, type ChatLanguage } from '@/context/LanguageContext';

interface Props {
  student: StudentProfile | undefined;
}

export function StudentMenu({ student }: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { themeName, setThemeName } = useAppTheme();
  const { language, setLanguage } = useLanguage();

  const initials = student ? studentInitials(student.displayName) : '?';

  const handleThemeChange = (_e: React.MouseEvent<HTMLElement>, value: ThemeName | null) => {
    if (value !== null) setThemeName(value);
  };

  const handleLanguageChange = (_e: React.MouseEvent<HTMLElement>, value: ChatLanguage | null) => {
    if (value !== null) setLanguage(value);
  };


  return (
    <>
      <IconButton
        onClick={(e) => {
          setAnchor(e.currentTarget);
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
          setAnchor(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 280 }}>
          <Typography variant="subtitle2" noWrap>
            {student?.displayName ?? '...'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {student?.email ?? ''}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Thema
          </Typography>
          <ToggleButtonGroup
            value={themeName}
            exclusive
            onChange={handleThemeChange}
            size="small"
            color="primary"
            fullWidth
            aria-label="Thema kiezen"
          >
            <ToggleButton value="fontysPurple" aria-label="Fontys Purple thema">
              Fontys Purple
            </ToggleButton>
            <ToggleButton value="kingsOrange" aria-label="Kings Orange thema">
              Kings Orange
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Chatbot taal
          </Typography>
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={handleLanguageChange}
            size="small"
            color="primary"
            fullWidth
            aria-label="Chatbot taal kiezen"
          >
            <ToggleButton value="nl" aria-label="Nederlands">
              NL
            </ToggleButton>
            <ToggleButton value="en" aria-label="English">
              EN
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        <MenuItem disabled>
          <ListItemText>Uitloggen</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
