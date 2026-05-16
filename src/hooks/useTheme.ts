import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const useTheme = () => {
  return {
    colors,
    spacing,
    typography,
    isDark: true, // Always dark as per the "deep navy" requirement
  };
};
