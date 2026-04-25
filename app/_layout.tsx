import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { getHasOnboarded } from '@/src/storage/backend';

const LabWatchTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.accent,
    background: Colors.bg,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    notification: Colors.statusDown,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getHasOnboarded().then((onboarded) => {
      if (!onboarded) {
        router.replace('/welcome');
      }
      setChecked(true);
    });
  }, []);

  return (
    <ThemeProvider value={LabWatchTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}