import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';

import HomePage from './pages/HomePage';
import Abstract from './pages/Abstract';
import SinglePrediction from './pages/SinglePrediction';
import BatchPrediction from './pages/BatchPrediction';
import AttackLogs from './pages/AttackLogs';

/* ===================== THEME ===================== */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f97316' },
    secondary: { main: '#60a5fa' },
    background: {
      default: '#020617',
      paper: alpha('#0f172a', 0.95),
    },
    text: {
      primary: '#e5e7eb',
      secondary: alpha('#e5e7eb', 0.7),
    },
    error: { main: '#ef4444' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    info: { main: '#3b82f6' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '3.5rem' },
    h2: { fontWeight: 700, fontSize: '2.5rem' },
    h3: { fontWeight: 700, fontSize: '2rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.85rem', lineHeight: 1.5 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 6px 20px rgba(249, 115, 22, 0.3)',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(249, 115, 22, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.75) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        },
      },
    },
  },
});

/* ===================== GLOBAL STYLES ===================== */
const globalStyles = (
  <GlobalStyles
    styles={{
      'html, body': {
        margin: 0,
        padding: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      },
      '#root': {
        height: '100vh',
        width: '100vw',
      },
      '::-webkit-scrollbar': { width: '6px' },
      '::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '3px',
      },
      '::-webkit-scrollbar-thumb': {
        background: 'rgba(249, 115, 22, 0.3)',
        borderRadius: '3px',
        '&:hover': {
          background: 'rgba(249, 115, 22, 0.5)',
        },
      },
      body: {
        background: '#020617',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*': { boxSizing: 'border-box' },
    }}
  />
);

/* ===================== KEYBOARD NAV ===================== */
const KeyboardNavWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const paths = [
      '/',
      '/abstract',
      '/single-prediction',
      '/batch-prediction',
      '/attacks',
    ];

    const handleKeyDown = (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key))
        return;

      const index = paths.indexOf(location.pathname);
      if (index === -1) return;

      let next = index;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        next = Math.min(paths.length - 1, index + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        next = Math.max(0, index - 1);

      if (next !== index) {
        e.preventDefault();
        navigate(paths[next]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, navigate]);

  return children;
};

/* ===================== APP ===================== */
function App() {
  return (
    <ThemeProvider theme={theme}>
      {globalStyles}
      <CssBaseline />

      <KeyboardNavWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/abstract" element={<Abstract />} />
          <Route path="/single-prediction" element={<SinglePrediction />} />
          <Route path="/batch-prediction" element={<BatchPrediction />} />
          <Route path="/attacks" element={<AttackLogs />} />

          {/* SPA fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </KeyboardNavWrapper>
    </ThemeProvider>
  );
}

export default App;
