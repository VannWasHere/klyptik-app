import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

export default function ProtectedLayout() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const theme = getTheme(isDark);
  
  // Check if we're loading
  if (isLoading) {
    return null; // Or return a loading spinner
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
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