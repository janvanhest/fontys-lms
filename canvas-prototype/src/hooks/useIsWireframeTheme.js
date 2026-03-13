import { useTheme } from '@mui/material/styles';

export function useIsWireframeTheme() {
  const theme = useTheme();
  return theme.custom?.isWireframe ?? false;
}
