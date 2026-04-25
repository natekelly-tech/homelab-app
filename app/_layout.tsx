import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';

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
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={LabWatchTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}