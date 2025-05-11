import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

export default function AuthLayout() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      />
    </View>
  );
} 