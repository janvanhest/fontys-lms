import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      isWireframe: boolean;
    };
  }

  interface ThemeOptions {
    custom?: {
      isWireframe?: boolean;
    };
  }
}
