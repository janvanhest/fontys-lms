import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';

/**
 * A dot that sits on the vertical timeline line.
 * variant="group"  → larger, marks a week group
 * variant="card"   → smaller, marks an individual activity
 */
export default function TimelineDot({ variant = 'card', isSelected = false }) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const primary = theme.palette.primary.main;
  const bg      = theme.palette.background.default;

  if (variant === 'group') {
    return isWireframe ? (
      <Box sx={{ width: 10, height: 10, border: `2px solid ${theme.palette.text.secondary}`, backgroundColor: bg, zIndex: 1 }} />
    ) : (
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: primary, outline: `2px solid ${bg}`, zIndex: 1 }} />
    );
  }

  // variant === 'card'
  return isWireframe ? (
    <Box sx={{
      width: 7, height: 7,
      border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.text.disabled}`,
      backgroundColor: isSelected ? theme.palette.primary.main : bg,
      zIndex: 1,
    }} />
  ) : (
    <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: primary, outline: `2px solid ${bg}`, zIndex: 1 }} />
  );
}
