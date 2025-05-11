import { Slot } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { getTheme } from './theme/theme';

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View);

function AppLayout() {
  const { isDark, animatedBackground } = useTheme();
  const theme = getTheme(isDark);
  
  return (
    <AnimatedView style={[{ 
      flex: 1
    }, animatedBackground]}>
      <StatusBar style={theme.statusBar} />
      <Slot />
      <Toast />
    </AnimatedView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QuizProvider>
          <AppLayout />
        </QuizProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
