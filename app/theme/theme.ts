import { StatusBarStyle } from 'expo-status-bar';

export const lightTheme = {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#007BFF',
    secondary: '#6c757d',
    accent: '#28a745',
    border: '#dee2e6',
    card: '#f8f9fa',
    error: '#dc3545',
    statusBar: 'dark' as StatusBarStyle,
};

export const darkTheme = {
    background: '#181829',
    text: '#FFFFFF',
    primary: '#3b82f6',
    secondary: '#6c757d',
    accent: '#10b981',
    border: '#444',
    card: '#212130',
    error: '#ef4444',
    statusBar: 'light' as StatusBarStyle,
};

export type ThemeColors = typeof lightTheme;

export const getTheme = (isDark: boolean): ThemeColors => {
    return isDark ? darkTheme : lightTheme;
}; 