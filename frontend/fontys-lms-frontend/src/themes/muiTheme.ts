/* eslint-disable max-lines */
import { createTheme } from "@mui/material/styles";

export const fontysColors = {
  paars: {
    50: "#f3eaf3",
    200: "#c49ac4",
    300: "#aa7aaa",
    main: "#663366",
    dark: "#4d264d",
    900: "#331a33",
  },
  magenta: {
    50: "#fff0f5",
    main: "#CC0066",
    dark: "#990050",
  },
  blauw: {
    50: "#e6eef8",
    main: "#0055A2",
    dark: "#003d77",
  },
  oranje: "#E87722",
  groen: "#4A8C3F",
  geel: "#F0C630",
} as const;

const typography = {
  fontFamily: ["Roboto", "Arial", "sans-serif"].join(","),
  h1: {
    fontSize: "2.25rem",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "1.75rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.375rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  h5: {
    fontSize: "1rem",
    fontWeight: 600,
  },
  h6: {
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  body1: {
    fontSize: "0.9375rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  button: {
    fontWeight: 600,
    textTransform: "none" as const,
    letterSpacing: "0.01em",
  },
  caption: {
    fontSize: "0.75rem",
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
};

function makeComponents(
  primaryMain: string,
  primaryDark: string,
  primaryLightBg: string,
) {
  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: "8px 20px",
          fontWeight: 600,
          textTransform: "none" as const,
          "&.MuiButton-containedPrimary": {
            backgroundColor: primaryMain,
            "&:hover": {
              backgroundColor: primaryDark,
            },
          },
          "&.MuiButton-outlinedPrimary": {
            borderColor: primaryMain,
            color: primaryMain,
            "&:hover": {
              backgroundColor: primaryLightBg,
              borderColor: primaryDark,
            },
          },
          "&.MuiButton-textPrimary": {
            color: primaryMain,
            "&:hover": {
              backgroundColor: primaryLightBg,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: primaryMain,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: primaryLightBg,
          color: primaryMain,
          border: `1px solid ${primaryMain}40`,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: primaryMain,
          "&:hover": {
            color: primaryDark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined" as const,
        size: "medium" as const,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
            borderColor: primaryMain,
          },
          "& label.Mui-focused": {
            color: primaryMain,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: primaryMain,
          "&.Mui-checked": {
            color: primaryMain,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: primaryMain,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: primaryMain,
            "& + .MuiSwitch-track": {
              backgroundColor: primaryMain,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: primaryMain,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontWeight: 500,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          "&.MuiFab-primary": {
            backgroundColor: primaryMain,
            "&:hover": {
              backgroundColor: primaryDark,
            },
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          "&.MuiBadge-colorPrimary": {
            backgroundColor: primaryMain,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  };
}

export const fontysDefaultTheme = createTheme({
  palette: {
    primary: {
      light: fontysColors.paars[300],
      main: fontysColors.paars.main,
      dark: fontysColors.paars.dark,
      contrastText: "#fff",
    },
    secondary: {
      main: fontysColors.magenta.main,
      dark: fontysColors.magenta.dark,
      contrastText: "#fff",
    },
    info: {
      main: fontysColors.blauw.main,
      dark: fontysColors.blauw.dark,
      contrastText: "#fff",
    },
    warning: {
      main: fontysColors.oranje,
    },
    success: {
      main: fontysColors.groen,
    },
    error: {
      main: "#d32f2f",
    },
    background: {
      default: "#f9f7f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#5f5f5f",
    },
  },
  typography,
  shape: {
    borderRadius: 4,
  },
  components: makeComponents(
    fontysColors.paars.main,
    fontysColors.paars.dark,
    fontysColors.paars[50],
  ),
});

export const fontysOranjeTheme = createTheme({
  palette: {
    primary: {
      light: "#f5a559",
      main: "#E87722",
      dark: "#b85a10",
      contrastText: "#fff",
    },
    secondary: {
      main: fontysColors.paars.main,
      dark: fontysColors.paars.dark,
      contrastText: "#fff",
    },
    info: {
      main: fontysColors.blauw.main,
      contrastText: "#fff",
    },
    warning: {
      main: fontysColors.geel,
    },
    success: {
      main: fontysColors.groen,
    },
    error: {
      main: "#d32f2f",
    },
    background: {
      default: "#fffaf5",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#5f5f5f",
    },
  },
  typography,
  shape: {
    borderRadius: 4,
  },
  components: makeComponents("#E87722", "#b85a10", "#fff3e6"),
});

export default fontysDefaultTheme;
