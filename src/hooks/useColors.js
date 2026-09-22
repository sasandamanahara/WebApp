import { useTheme } from '@mui/material/styles';
import { DARK_COLORS, LIGHT_COLORS } from '../theme/theme';

/**
 * Returns the correct color palette for the current theme mode.
 * Use this instead of importing COLORS directly so components
 * react correctly to light/dark mode switches.
 */
const useColors = () => {
  const theme = useTheme();
  return theme.palette.mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};

export default useColors;
