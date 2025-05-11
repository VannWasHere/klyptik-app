import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './theme/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(protected)/home" />;
  } else {
    return <Redirect href="/(auth)/splash" />;
  }
}
