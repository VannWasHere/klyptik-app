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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Create animated components
const AnimatedText = Animated.createAnimatedComponent(Text);

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
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const usernameOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  
  // Initialize animations
  useEffect(() => {
    // Sequence the animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    usernameOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 800 }));
    buttonsOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));
  }, []);
  
  // Animation styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));
  
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }]
  }));
  
  const usernameStyle = useAnimatedStyle(() => ({
    opacity: usernameOpacity.value,
    transform: [{ translateY: (1 - usernameOpacity.value) * 15 }]
  }));
  
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: (1 - subtitleOpacity.value) * 10 }]
  }));
  
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: (1 - buttonsOpacity.value) * 30 }]
  }));
  
  const modalStyle = useAnimatedStyle(() => ({
    opacity: showFeedbackModal ? withTiming(1, { duration: 300 }) : 0,
    transform: [{ 
      translateY: showFeedbackModal 
        ? withTiming(0, { duration: 500 }) 
        : 50 
    }]
  }));

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
      <Animated.View 
        style={[styles.header, headerStyle]}
      >
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
      </Animated.View>
      
      <Animated.View style={styles.content}>
        <AnimatedText style={[styles.title, { color: theme.text }, titleStyle]}>
          Welcome to Klyptik
        </AnimatedText>
        
        {user && user.display_name && (
          <AnimatedText style={[styles.username, { color: theme.primary }, usernameStyle]}>
            Hello, {user.display_name}!
          </AnimatedText>
        )}
        
        <AnimatedText style={[styles.subtitle, { color: isDark ? '#aaa' : '#666' }, subtitleStyle]}>
          You are logged in!
        </AnimatedText>
        
        <Animated.View style={[styles.buttonContainer, buttonsStyle]}>
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
        </Animated.View>
      </Animated.View>
      
      {/* Feedback Modal with custom form handling */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[styles.modalContent, { backgroundColor: theme.card }, modalStyle]}
          >
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
          </Animated.View>
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