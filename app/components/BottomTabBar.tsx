import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Define types for Ionicons names to avoid type errors
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItemProps {
  label: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
  path: string;
  isActive: boolean;
  onPress: () => void;
  theme: any;
}

const TabItem: React.FC<TabItemProps> = ({
  label,
  icon,
  activeIcon,
  isActive,
  onPress,
  theme
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        scale: withSpring(isActive ? 1.2 : 1, {
          damping: 15,
          stiffness: 150
        })
      }]
    };
  });
  
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isActive ? activeIcon : icon}
          size={24}
          color={isActive ? theme.primary : theme.text}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          {
            color: isActive ? theme.primary : theme.text,
            fontWeight: isActive ? '600' : 'normal'
          }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const BottomTabBar = () => {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  
  // Define tab routes
  const tabs = [
    {
      label: 'Home',
      icon: 'home-outline' as IoniconsName,
      activeIcon: 'home' as IoniconsName,
      path: '/(protected)/home'
    },
    {
      label: 'History',
      icon: 'time-outline' as IoniconsName,
      activeIcon: 'time' as IoniconsName,
      path: '/(protected)/quiz-history'
    },
    {
      label: 'Profile',
      icon: 'person-outline' as IoniconsName,
      activeIcon: 'person' as IoniconsName,
      path: '/(protected)/profile'
    }
  ];
  
  const handleNavigation = (path: string) => {
    // Workaround to avoid type issues with router.push
    router.push(path as any);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.path}
          label={tab.label}
          icon={tab.icon}
          activeIcon={tab.activeIcon}
          path={tab.path}
          isActive={pathname === tab.path}
          onPress={() => handleNavigation(tab.path)}
          theme={theme}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    paddingBottom: 10
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4
  }
});

export default BottomTabBar; 