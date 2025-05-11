import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

export default function ProtectedLayout() {
  const { isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const theme = getTheme(isDark);
  
  // Animation value
  const opacity = useSharedValue(0);
  
  // Animate on mount
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
  }, []);
  
  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    };
  });
  
  // Check if we're loading
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background 
      }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return (
    <Animated.View 
      style={[{ flex: 1, backgroundColor: theme.background }, animatedStyle]}
    >
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade_from_bottom',
          animationDuration: 350,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Animated.View>
  );
} 