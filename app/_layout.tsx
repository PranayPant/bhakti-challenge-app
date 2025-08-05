import { useFonts } from 'expo-font';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TourGuideProvider, TourGuideZoneByPosition } from 'rn-tourguide';
import { TourPortal } from '@/components/TourDialog';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  const [loaded] = useFonts({
    NotoSansDevanagari: require('../assets/fonts/NotoSansDevanagari-Regular.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TourGuideProvider androidStatusBarVisible>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <PaperProvider theme={MD3DarkTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <TourPortal />
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <TourGuideZoneByPosition
        text="Try the quiz mode to challenge yourself! Double tap on the card to flip and reveal the dohas!"
        zone={8}
        shape={'circle'}
        isTourGuide
        bottom={Platform.OS === 'ios' ? 30 : 0}
        right={Platform.OS === 'ios' ? 55 : 60}
        width={100}
        height={100}
        tooltipBottomOffset={50}
      />
      <Toast position="bottom" bottomOffset={insets.bottom + 50} visibilityTime={2000} />
    </TourGuideProvider>
  );
}
