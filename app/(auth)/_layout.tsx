import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

export default function AuthLayout() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  
  return (
    <>
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </>
  );
} 