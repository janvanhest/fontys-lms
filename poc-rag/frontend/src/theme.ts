import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#0c6c56",
    },
    background: {
      default: "#f4f7f2",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    h6: {
      letterSpacing: "-0.02em",
    },
  },
});
