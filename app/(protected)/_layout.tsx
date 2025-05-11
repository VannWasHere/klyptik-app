import { Redirect, Stack, usePathname } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const pathname = usePathname();
  
  const hideTabBarPaths = [
    '/quiz',           
    '/quiz-setup'      
  ];
  
  const showTabBarPaths = [
    '/quiz-history',   
    '/profile',         
    '/home'             
  ];
  
  const isExplicitShowPath = showTabBarPaths.some(path => pathname.includes(path));
  
  const shouldHideTabBar = !isExplicitShowPath && 
    (hideTabBarPaths.some(path => pathname.includes(path)) || 
     pathname.includes('/quiz/')); 
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }} />
      {!shouldHideTabBar && <BottomTabBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 