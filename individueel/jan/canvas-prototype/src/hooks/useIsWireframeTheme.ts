import { useTheme } from '@mui/material/styles';

export function useIsWireframeTheme(): boolean {
  const theme = useTheme();
  return theme.custom.isWireframe;
}
