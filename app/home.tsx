import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './theme/theme';

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={styles.themeToggle} 
        onPress={toggleTheme}
      >
        <Ionicons 
          name={isDark ? 'sunny-outline' : 'moon-outline'} 
          size={24} 
          color={theme.text} 
        />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: theme.text }]}>Welcome to Klyptik</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#666' }]}>You are logged in!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
  },
}); 