import { Slot } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { getTheme } from './theme/theme';

function AppLayout() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.background 
    }}>
      <StatusBar style={theme.statusBar} />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}
