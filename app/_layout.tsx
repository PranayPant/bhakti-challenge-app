import { useFonts } from 'expo-font';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TourGuideProvider } from 'rn-tourguide';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

async function handleInteractiveTour() {
  const hasSeenTour = Boolean(await AsyncStorage.getItem('seen-tour'));
  if (hasSeenTour) {
    // After showing the tour, set the flag
    await AsyncStorage.setItem('seen-tour', '');
  }
}

export default function RootLayout() {
  const [loaded] = useFonts({
    ArvindR: require('../assets/fonts/arvindr.ttf')
  });

  useEffect(() => {
    handleInteractiveTour();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TourGuideProvider androidStatusBarVisible startAtMount>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <PaperProvider theme={MD3DarkTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </TourGuideProvider>
  );
}
