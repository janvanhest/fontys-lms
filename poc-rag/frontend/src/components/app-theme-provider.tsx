'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import type { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0c6c56',
    },
    background: {
      default: '#f4f7f2',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    h6: {
      letterSpacing: '-0.02em',
    },
  },
});

export function AppThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
