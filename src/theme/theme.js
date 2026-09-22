import { createTheme } from '@mui/material/styles';

// ── Dark mode color palette ──────────────────────────────────
export const DARK_COLORS = {
  navy: '#0a0e1a',
  navyMid: '#0f1629',
  navyLight: '#1a2540',
  navyCard: '#141c2e',
  accent: '#00d4ff',
  accentGlow: 'rgba(0,212,255,0.15)',
  accentDark: '#0099bb',
  green: '#00e676',
  red: '#ff1744',
  amber: '#ffab00',
  blue: '#2979ff',
  border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(0,212,255,0.25)',
  textPrimary: '#e8eaf6',
  textSecondary: '#8892a4',
  textMuted: '#4a5568',
  esp01: '#00d4ff',
  esp02: '#00e676',
  dht22: '#ffab00',
  ds18b20: '#7c4dff',
  surface: 'rgba(15,22,41,0.95)',
  sectionDivider: 'rgba(255,255,255,0.05)',
};

// ── Light mode color palette ─────────────────────────────────
export const LIGHT_COLORS = {
  navy: '#f0f4fb',
  navyMid: '#e4ecf7',
  navyLight: '#d0ddf0',
  navyCard: '#ffffff',
  accent: '#0066cc',
  accentGlow: 'rgba(0,102,204,0.1)',
  accentDark: '#0052a3',
  green: '#1b7a3e',
  red: '#c0001b',
  amber: '#b36a00',
  blue: '#1a56c4',
  border: 'rgba(0,0,0,0.08)',
  borderAccent: 'rgba(0,102,204,0.25)',
  textPrimary: '#0d1b2a',
  textSecondary: '#4a5568',
  textMuted: '#8892a4',
  esp01: '#0066cc',
  esp02: '#1b7a3e',
  dht22: '#b36a00',
  ds18b20: '#6200ea',
  surface: 'rgba(255,255,255,0.97)',
  sectionDivider: 'rgba(0,0,0,0.06)',
};

// Legacy export for components that haven't migrated to useColors() yet
export const COLORS = DARK_COLORS;

// ── Theme factory ────────────────────────────────────────────
export const createAppTheme = (mode) => {
  const C = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#070c18' : '#eef2f9',
        paper: isDark ? '#0f1629' : '#ffffff',
      },
      primary: {
        main: C.accent,
        light: isDark ? '#5ce8ff' : '#3d9eff',
        dark: C.accentDark,
        contrastText: isDark ? '#000' : '#fff',
      },
      secondary: {
        main: isDark ? '#7c4dff' : '#6200ea',
        light: isDark ? '#b47cff' : '#9d46ff',
        dark: isDark ? '#3f1dcb' : '#3700b3',
        contrastText: '#ffffff',
      },
      success: {
        main: isDark ? '#00e676' : '#1b7a3e',
        contrastText: isDark ? '#000' : '#fff',
      },
      error: {
        main: isDark ? '#ff1744' : '#c0001b',
        contrastText: '#fff',
      },
      warning: {
        main: isDark ? '#ffab00' : '#b36a00',
        contrastText: isDark ? '#000' : '#fff',
      },
      info: {
        main: isDark ? '#2979ff' : '#1a56c4',
        contrastText: '#fff',
      },
      text: {
        primary: C.textPrimary,
        secondary: C.textSecondary,
        disabled: C.textMuted,
      },
      divider: C.border,
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 600, letterSpacing: '0.05em' },
      body1: { fontWeight: 400 },
      body2: { fontWeight: 400 },
      caption: { fontWeight: 500, letterSpacing: '0.04em' },
      button: { fontWeight: 600, letterSpacing: '0.06em' },
      overline: { fontWeight: 700, letterSpacing: '0.12em' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark
              ? 'linear-gradient(135deg, rgba(15,22,41,0.95) 0%, rgba(20,28,46,0.95) 100%)'
              : '#ffffff',
            border: `1px solid ${C.border}`,
            backdropFilter: isDark ? 'blur(20px)' : 'none',
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 1px 12px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow: isDark
                ? `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${C.borderAccent}`
                : `0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px ${C.borderAccent}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 16px ${C.accentGlow}`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, letterSpacing: '0.04em' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            color: C.textSecondary,
            borderBottom: `1px solid ${C.border}`,
          },
          body: {
            borderBottom: isDark ? `1px solid rgba(255,255,255,0.04)` : `1px solid rgba(0,0,0,0.05)`,
            fontSize: '0.85rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              background: isDark ? 'rgba(0,212,255,0.04)' : 'rgba(0,102,204,0.04)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: C.border } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: isDark ? 'rgba(10,14,26,0.95)' : 'rgba(13,27,42,0.92)',
            border: `1px solid ${C.borderAccent}`,
            fontSize: '0.8rem',
            fontWeight: 500,
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          rail: {
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? 'rgba(7,12,24,0.92)'
              : 'rgba(255,255,255,0.92)',
            borderBottom: isDark
              ? '1px solid rgba(0,212,255,0.12)'
              : '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
    },
  });
};

// Default export for backward compat
export default createAppTheme('dark');
