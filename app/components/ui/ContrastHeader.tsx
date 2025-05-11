import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface ContrastHeaderProps {
  title: string;
  welcomeMessage?: string;
  showThemeToggle?: boolean;
  showLogout?: boolean;
}

const ContrastHeader: React.FC<ContrastHeaderProps> = ({
  title,
  welcomeMessage,
  showThemeToggle = true,
  showLogout = true,
}) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // Contrast colors - opposite of the current theme
  const headerBg = isDark ? '#ffffff' : '#222222';
  const textColor = isDark ? '#222222' : '#ffffff';
  const buttonBg = isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
  
  
  return (
    <View style={[styles.header, { backgroundColor: headerBg }]}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
          {welcomeMessage && (
            <Text style={[styles.welcomeText, { color: textColor }]}>
              {welcomeMessage}
            </Text>
          )}
        </View>
        
        <View style={styles.headerButtons}>
          {showThemeToggle && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: buttonBg }]}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDark ? "sunny-outline" : "moon-outline"} 
                size={24} 
                color={textColor} 
              />
            </TouchableOpacity>
          )}
          
          {showLogout && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: buttonBg }]}
              onPress={logout}
            >
              <Ionicons 
                name="log-out-outline" 
                size={24} 
                color={textColor} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    marginTop: 5,
    opacity: 0.9,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});

export default ContrastHeader; 