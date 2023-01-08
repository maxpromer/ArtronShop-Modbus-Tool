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
      main: '#3498DB',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: "supermarket",
    h1: {
      fontSize: 36,
      color: '#2ECC71',
    },
  },
});

export default theme;
