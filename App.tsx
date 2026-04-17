import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import RootNavigator from './src/navigation/RootNavigator';
import { initI18n } from './src/i18n';

// Keep the splash screen visible while we fetch resources
import { AuthProvider } from './src/supabase/AuthContext';
import { NotificationsProvider } from './src/supabase/NotificationsContext';
import { ChatProvider } from './src/supabase/ChatContext';

export default function App() {
  const { isDark } = useTheme();
  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && i18nReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, i18nReady]);

  if ((!fontsLoaded && !fontError) || !i18nReady) {
    return null;
  }

  return (
    <AuthProvider>
      <NotificationsProvider>
        <ChatProvider>
          <RootNavigator />
        </ChatProvider>
      </NotificationsProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </AuthProvider>
  );
}
