import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { alpha, useTheme } from '@mui/material/styles';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';
import TimelineDot from './TimelineDot';
import { STATUS_COLORS, STATUS_LABELS, STATUSES, ACTIVITY_TYPES } from '../constants/activityStatus';

const DOT_COL = 24; // px — must match ActivitiesPanel

export default function ActivityCard({ activity, status, onStatusChange, isSelected, onClick }) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const primary = theme.palette.primary.main;

  // Menu state: null | 'main' | 'type' | 'status'
  const [activeMenu, setActiveMenu] = useState(null);
  const menuAnchorRef = useRef(null);

  const openMenu = (e) => {
    e.stopPropagation();
    setActiveMenu('main');
  };
  const closeMenu = () => setActiveMenu(null);

  const statusColor = STATUS_COLORS[status] ?? primary;
  const borderAccent = isWireframe
    ? alpha(statusColor, 0.6)
    : statusColor;

  const wireframeCardSx = {
    border: isSelected
      ? `1px solid ${theme.palette.primary.main}`
      : `1px dashed ${theme.palette.text.disabled}`,
    borderLeft: `4px solid ${borderAccent}`,
    backgroundColor: isSelected
      ? theme.palette.action.selected
      : theme.palette.background.default,
  };

  const muiCardSx = {
    borderLeft: `4px solid ${borderAccent}`,
    backgroundColor: isSelected ? alpha(primary, 0.04) : 'background.paper',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      {/* Dot column */}
      <Box sx={{ width: DOT_COL, flexShrink: 0, display: 'flex', justifyContent: 'center', pt: '14px' }}>
        <TimelineDot variant="card" isSelected={isSelected} />
      </Box>

      {/* Card */}
      <Paper
        elevation={isWireframe ? 0 : (isSelected ? 4 : 2)}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
        aria-pressed={isSelected}
        sx={{
          flex: 1,
          py: 1.5,
          px: 2,
          cursor: 'pointer',
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            backgroundColor: isWireframe
              ? theme.palette.action.hover
              : alpha(primary, 0.07),
          },
          '&:focus-visible': {
            outline: `2px solid ${primary}`,
            outlineOffset: 2,
          },
          ...(isWireframe ? wireframeCardSx : muiCardSx),
        }}
      >
        {/* Top row: tag chip + three-dot button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Chip
            label={activity.tag}
            size="small"
            variant={isWireframe ? 'outlined' : 'filled'}
            sx={{
              height: 18,
              fontSize: 10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              ...(isWireframe ? {} : {
                backgroundColor: alpha(primary, 0.12),
                color: primary,
                fontWeight: 'bold',
                border: 'none',
              }),
            }}
          />

          <IconButton
            ref={menuAnchorRef}
            size="small"
            onClick={openMenu}
            aria-label="Opties"
            sx={{
              p: 0.25,
              mr: -0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.35 }}>
          {activity.title}
        </Typography>

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {activity.deadline}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isWireframe ? 'text.secondary' : statusColor,
              fontWeight: isWireframe ? 'normal' : 'medium',
            }}
          >
            {STATUS_LABELS[status] ?? activity.status}
          </Typography>
        </Stack>
      </Paper>

      {/* Main context menu */}
      <Menu
        anchorEl={menuAnchorRef.current}
        open={activeMenu === 'main'}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={closeMenu}>Hernoem titel</MenuItem>
        <MenuItem onClick={closeMenu}>Bewerk</MenuItem>
        <MenuItem onClick={() => setActiveMenu('type')}>Verander soort ›</MenuItem>
        <Divider />
        <MenuItem onClick={() => setActiveMenu('status')}>Markeer als... ›</MenuItem>
      </Menu>

      {/* Type submenu */}
      <Menu
        anchorEl={menuAnchorRef.current}
        open={activeMenu === 'type'}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => setActiveMenu('main')} sx={{ color: 'text.secondary', fontSize: 12 }}>
          ‹ Terug
        </MenuItem>
        <Divider />
        {ACTIVITY_TYPES.map((type) => (
          <MenuItem key={type} onClick={closeMenu}>{type}</MenuItem>
        ))}
      </Menu>

      {/* Status submenu */}
      <Menu
        anchorEl={menuAnchorRef.current}
        open={activeMenu === 'status'}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => setActiveMenu('main')} sx={{ color: 'text.secondary', fontSize: 12 }}>
          ‹ Terug
        </MenuItem>
        <Divider />
        {STATUSES.map((s) => (
          <MenuItem
            key={s}
            selected={s === status}
            onClick={() => { onStatusChange(s); closeMenu(); }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: STATUS_COLORS[s],
                mr: 1.5,
                flexShrink: 0,
              }}
            />
            {STATUS_LABELS[s]}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
