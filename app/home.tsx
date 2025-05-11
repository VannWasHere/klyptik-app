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
        style={[styles.themeToggle, { backgroundColor: isDark ? theme.card : '#eee' }]} 
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
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.outlineButton, { borderColor: theme.border }]}
        >
          <Text style={[styles.outlineButtonText, { color: theme.text }]}>Learn More</Text>
        </TouchableOpacity>
      </View>
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
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 