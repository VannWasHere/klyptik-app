import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View);

export default function AuthLayout() {
  const { isDark, animatedBackground } = useTheme();
  const theme = getTheme(isDark);
  
  return (
    <AnimatedView style={[{ flex: 1 }, animatedBackground]}>
      <StatusBar style={theme.statusBar} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade_from_bottom',
          animationDuration: 300,
          gestureEnabled: false,
        }}
      />
    </AnimatedView>
  );
} 