import { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { 
  Outfit_500Medium, 
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';

import { useTheme } from './src/hooks/useTheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { colors, typography, isDark } = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background }]} 
      onLayout={onLayoutRootView}
    >
      <View style={styles.content}>
        <Text style={[
          styles.heading, 
          { 
            color: colors.primary, 
            fontFamily: typography.fontFamily.heading,
            fontSize: typography.fontSize['3xl']
          }
        ]}>
          CharityTrust
        </Text>
        <Text style={[
          styles.subheading, 
          { 
            color: colors.mutedForeground, 
            fontFamily: typography.fontFamily.subheading,
            fontSize: typography.fontSize.lg
          }
        ]}>
          Humanitarian Accountability
        </Text>
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  heading: {
    marginBottom: 8,
  },
  subheading: {
    textAlign: 'center',
  },
});
