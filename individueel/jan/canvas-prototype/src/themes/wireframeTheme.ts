import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

const wireframeShadows = createTheme().shadows.map(() => 'none') as Theme['shadows'];

const wireframeTheme = createTheme({
  custom: { isWireframe: true },
  typography: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 12,
    button: { textTransform: 'none' },
  },
  palette: {
    mode: 'light',
    primary: { main: '#555555' },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#333333',
      secondary: '#888888',
    },
    divider: '#cccccc',
  },
  // Rule: never hardcode borderRadius in components — always inherit from shape.borderRadius.
  // Exception: MuiIconButton and MuiChip deliberately override to 0 for the square wireframe aesthetic.
  shape: { borderRadius: 4 },
  shadows: wireframeShadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `2px dashed ${theme.palette.text.secondary}`,
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.background.default,
          '&:hover': { backgroundColor: theme.palette.action.hover },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.palette.divider }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontFamily: '"Courier New", Courier, monospace',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            fontWeight: 'bold',
            '&:hover': { backgroundColor: theme.palette.action.hover },
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          border: `1px dashed ${theme.palette.text.secondary}`,
          backgroundColor: 'transparent',
          color: theme.palette.text.secondary,
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: 10,
        }),
        label: { paddingLeft: 6, paddingRight: 6 },
      },
    },
    MuiCollapse: {
      styleOverrides: { root: { flexShrink: 0 } },
    },
  },
});

export default wireframeTheme;
