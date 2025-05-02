import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as DB from '../db/SqLiteDb';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { syncExpensesWithBackend } from '../utils/syncManager';
import Toast from 'react-native-toast-message';
import { toastConfig } from "../components/Toast"; // path to your file

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

DB.createTable();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    bold: require('../assets/fonts/Lemon-Regular.ttf'),
  });
  useDrizzleStudio(DB.db);
  useEffect(() => {
    const interval = setInterval(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          syncExpensesWithBackend(); // your sync function
        } else {
          console.log('No internet connection');
        }
      });
    }, 3000); // 3 seconds

    return () => clearInterval(interval); // cleanup
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
