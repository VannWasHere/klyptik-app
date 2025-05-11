import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProtectedLayout() {
  const { isDark, animatedBackground } = useTheme();
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
      <AnimatedView style={[{ 
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center'
      }, animatedBackground]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </AnimatedView>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return (
    <AnimatedView 
      style={[{ flex: 1 }, animatedBackground, animatedStyle]}
    >
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade_from_bottom',
          animationDuration: 350,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </AnimatedView>
  );
} 