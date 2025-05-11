import { Redirect, Stack } from 'expo-router';
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
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }} />
      <BottomTabBar />
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