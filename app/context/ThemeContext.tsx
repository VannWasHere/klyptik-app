import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { getTheme } from '../theme/theme';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isDark: boolean;
  transitionProgress: Animated.SharedValue<number>;
  animatedBackground: any; // Animated style for background
  animatedText: any; // Animated style for text
  animatedCard: any; // Animated style for cards
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [prevTheme, setPrevTheme] = useState<ThemeType>('dark');
  
  // Animation value for theme transition
  const transitionProgress = useSharedValue(1); // 0 is light, 1 is dark
  
  useEffect(() => {
    // Initialize with dark theme
    setTheme('dark');
    setPrevTheme('dark');
    transitionProgress.value = 1;
  }, []);

  useEffect(() => {
    if (theme !== prevTheme) {
      // Animate theme transition
      transitionProgress.value = withTiming(
        theme === 'dark' ? 1 : 0, 
        { duration: 400 }
      );
      setPrevTheme(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  
  // Theme values for light and dark
  const lightTheme = getTheme(false);
  const darkTheme = getTheme(true);
  
  // Animated styles for different UI elements
  const animatedBackground = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        transitionProgress.value,
        [0, 1],
        [lightTheme.background, darkTheme.background]
      )
    };
  });
  
  const animatedText = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        transitionProgress.value,
        [0, 1],
        [lightTheme.text, darkTheme.text]
      )
    };
  });
  
  const animatedCard = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        transitionProgress.value,
        [0, 1],
        [lightTheme.card, darkTheme.card]
      )
    };
  });

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        toggleTheme, 
        isDark, 
        transitionProgress,
        animatedBackground,
        animatedText,
        animatedCard
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 