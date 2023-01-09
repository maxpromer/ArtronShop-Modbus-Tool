import { Roboto } from '@next/font/google';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#2ECC71',
    },
    secondary: {
      main: '#E74C3C',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: "Kanit",
    h1: {
      fontSize: 36,
      color: '#2ECC71',
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
          input: {
              color: "#34495E",
          },
          root: {
              borderColor: "#EFEFEF !important",
              borderRadius: "10px !important",
          }
      }
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          color: "#FFF",
          borderRadius: 10
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: "0 5px 20px rgb(0 0 0 / 17%)"
        }
      }
    }
  }
});

export default theme;
