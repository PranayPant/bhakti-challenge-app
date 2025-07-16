import { useFonts } from 'expo-font';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TourGuideProvider, TourGuideZoneByPosition } from 'rn-tourguide';
import { TourPortal } from '@/components/TourDialog';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    ArvindR: require('../assets/fonts/arvindr.ttf')
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
        zone={7}
        shape={'circle'}
        isTourGuide
        bottom={20}
        right={45}
        width={100}
        height={100}
      />
    </TourGuideProvider>
  );
}
