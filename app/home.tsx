import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from './context/ThemeContext';
import * as authService from './services/authService';
import { getTheme } from './theme/theme';

interface FeedbackErrors {
  subject?: string;
  message?: string;
}

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FeedbackErrors>({});

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getAuthToken();
      
      if (!token) {
        // Redirect to login if no token
        router.replace('/');
      } else {
        // Get user data from localStorage
        const userData = authService.getUserData();
        if (userData && userData.display_name) {
          setDisplayName(userData.display_name);
        } else {
          setDisplayName('User');
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    // Clear auth token
    authService.removeAuthToken();
    
    // Show toast
    Toast.show({
      type: 'success',
      text1: 'Logged Out Successfully',
      position: 'bottom',
      visibilityTime: 2000
    });
    
    // Navigate to login screen
    setTimeout(() => {
      router.replace('/');
    }, 1000);
  };

  const validateFeedbackForm = (): boolean => {
    const newErrors: FeedbackErrors = {};
    
    if (!subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!message) {
      newErrors.message = 'Message is required';
    } else if (message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitFeedback = () => {
    if (validateFeedbackForm()) {
      console.log('Feedback submitted:', { subject, message });
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Feedback Submitted',
        text2: 'Thank you for your feedback!',
        position: 'bottom'
      });
      
      setShowFeedbackModal(false);
      setSubject('');
      setMessage('');
      setErrors({});
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
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
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isDark ? theme.card : '#eee' }]} 
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Welcome to Klyptik</Text>
        {displayName && (
          <Text style={[styles.username, { color: theme.primary }]}>Hello, {displayName}!</Text>
        )}
        <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#666' }]}>You are logged in!</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.outlineButton, { borderColor: theme.border, marginTop: 16 }]}
          >
            <Text style={[styles.outlineButtonText, { color: theme.text }]}>Learn More</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.outlineButton, { borderColor: theme.border, marginTop: 16 }]}
            onPress={() => setShowFeedbackModal(true)}
          >
            <Text style={[styles.outlineButtonText, { color: theme.text }]}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Feedback Modal with custom form handling */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Send Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Subject</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: theme.text, 
                      borderColor: errors.subject ? theme.error : theme.border,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                    }
                  ]}
                  placeholder="Enter subject"
                  placeholderTextColor={isDark ? '#aaa' : '#999'}
                  value={subject}
                  onChangeText={setSubject}
                />
                {errors.subject && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.subject}
                  </Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Message</Text>
                <TextInput
                  style={[
                    styles.textArea, 
                    { 
                      color: theme.text, 
                      borderColor: errors.message ? theme.error : theme.border,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                    }
                  ]}
                  placeholder="Enter your message"
                  placeholderTextColor={isDark ? '#aaa' : '#999'}
                  value={message}
                  onChangeText={setMessage}
                  multiline={true}
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                {errors.message && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.message}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
                onPress={handleSubmitFeedback}
              >
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  themeToggle: {
    padding: 10,
    borderRadius: 20,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 