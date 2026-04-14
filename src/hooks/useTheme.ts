import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export const useTheme = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return {
    colors,
    typography: Typography,
    isDark: colorScheme === 'dark',
    colorScheme,
  };
};
