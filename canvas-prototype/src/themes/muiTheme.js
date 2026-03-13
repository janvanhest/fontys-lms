import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  custom: { isWireframe: false },
  // Rule: never hardcode borderRadius in components — always inherit from shape.borderRadius.
  // In sx, pass as a string (`${theme.shape.borderRadius}px`) to avoid the numeric multiplier trap.
  shape: { borderRadius: 16 },
  typography: {
    button: { textTransform: 'none' },
  },
  components: {
    MuiCollapse: {
      styleOverrides: { root: { flexShrink: 0 } },
    },
  },
});

export default muiTheme;
