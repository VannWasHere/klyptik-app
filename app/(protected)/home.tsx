import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

interface FeedbackErrors {
  subject?: string;
  message?: string;
}

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const theme = getTheme(isDark);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FeedbackErrors>({});

  const handleLogout = () => {
    // Call logout from auth context
    logout();
    
    // Show toast
    Toast.show({
      type: 'success',
      text1: 'Logged Out Successfully',
      position: 'bottom',
      visibilityTime: 2000
    });
    
    // Navigate to login screen
    setTimeout(() => {
      router.replace('/(auth)/login');
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
        {user && user.display_name && (
          <Text style={[styles.username, { color: theme.primary }]}>Hello, {user.display_name}!</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  themeToggle: {
    padding: 10,
    borderRadius: 30,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
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
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
    maxWidth: 500,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 