import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';
import type { TimelineDotVariant } from '../types';

interface TimelineDotProps {
  variant?: TimelineDotVariant;
  isSelected?: boolean;
}

export default function TimelineDot({
  variant = 'card',
  isSelected = false,
}: TimelineDotProps) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const primary = theme.palette.primary.main;
  const background = theme.palette.background.default;

  if (variant === 'group') {
    return isWireframe ? (
      <Box
        sx={{
          width: 10,
          height: 10,
          border: `2px solid ${theme.palette.text.secondary}`,
          backgroundColor: background,
          zIndex: 1,
        }}
      />
    ) : (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: primary,
          outline: `2px solid ${background}`,
          zIndex: 1,
        }}
      />
    );
  }

  return isWireframe ? (
    <Box
      sx={{
        width: 7,
        height: 7,
        border: `1px solid ${
          isSelected ? theme.palette.primary.main : theme.palette.text.disabled
        }`,
        backgroundColor: isSelected ? theme.palette.primary.main : background,
        zIndex: 1,
      }}
    />
  ) : (
    <Box
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: primary,
        outline: `2px solid ${background}`,
        zIndex: 1,
      }}
    />
  );
}
