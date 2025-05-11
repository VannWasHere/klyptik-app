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
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Create animated components
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface FeedbackErrors {
  subject?: string;
  message?: string;
}

export default function Home() {
  const { isDark, toggleTheme, animatedBackground, animatedText, animatedCard, transitionProgress } = useTheme();
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
  const themeIconRotation = useSharedValue(0);
  const themeToggleScale = useSharedValue(1);
  
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

  // Animated button styles for theme toggle and logout
  const themeToggleStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        transitionProgress.value,
        [0, 1],
        ['#eee', theme.card]
      ),
      transform: [{ scale: themeToggleScale.value }]
    };
  });
  
  const themeIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ 
        rotate: `${themeIconRotation.value}deg` 
      }]
    };
  });
  
  const logoutButtonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        transitionProgress.value,
        [0, 1],
        ['#eee', theme.card]
      )
    };
  });
  
  // Modal background animation
  const modalContentStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        transitionProgress.value,
        [0, 1],
        [getTheme(false).card, getTheme(true).card]
      ),
      opacity: showFeedbackModal ? withTiming(1, { duration: 300 }) : 0,
      transform: [{ 
        translateY: showFeedbackModal 
          ? withTiming(0, { duration: 400 }) 
          : 50 
      }]
    };
  });

  const handleThemeToggle = () => {
    // Calculate the new rotation to avoid confusion with resetting to 0
    const startRotation = isDark ? 0 : 180;
    const endRotation = isDark ? 180 : 360;
    
    // Reset if we've completed a full spin
    themeIconRotation.value = startRotation;
    
    // Animate the rotation smoothly
    themeIconRotation.value = withTiming(endRotation, { 
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    
    // Add a scale animation
    themeToggleScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    
    // Toggle theme
    toggleTheme();
  };

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
    <AnimatedView style={[styles.container, animatedBackground]}>
      <Animated.View 
        style={[styles.header, headerStyle]}
      >
        <AnimatedTouchableOpacity 
          style={[styles.themeToggle, themeToggleStyle]} 
          onPress={handleThemeToggle}
        >
          <Animated.View style={themeIconStyle}>
            <Ionicons 
              name={isDark ? 'sunny-outline' : 'moon-outline'} 
              size={24} 
              color={theme.text}
            />
          </Animated.View>
        </AnimatedTouchableOpacity>
        
        <AnimatedTouchableOpacity 
          style={[styles.logoutButton, logoutButtonStyle]} 
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color={theme.text} 
          />
        </AnimatedTouchableOpacity>
      </Animated.View>
      
      <Animated.View style={styles.content}>
        <AnimatedText style={[styles.title, animatedText, titleStyle]}>
          Welcome to Klyptik
        </AnimatedText>
        
        {user && user.display_name && (
          <AnimatedText style={[styles.username, usernameStyle, { color: theme.primary }]}>
            Hello, {user.display_name}!
          </AnimatedText>
        )}
        
        <AnimatedText 
          style={[
            styles.subtitle, 
            subtitleStyle, 
            {
              color: interpolateColor(
                transitionProgress.value,
                [0, 1],
                ['#666', '#aaa']
              )
            }
          ]}
        >
          You are logged in!
        </AnimatedText>
        
        <Animated.View style={[styles.buttonContainer, buttonsStyle]}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          
          <AnimatedTouchableOpacity 
            style={[
              styles.outlineButton, 
              { 
                borderColor: interpolateColor(
                  transitionProgress.value,
                  [0, 1],
                  [getTheme(false).border, getTheme(true).border]
                ),
                marginTop: 16 
              }
            ]}
          >
            <AnimatedText style={[styles.outlineButtonText, animatedText]}>
              Learn More
            </AnimatedText>
          </AnimatedTouchableOpacity>
          
          <AnimatedTouchableOpacity 
            style={[
              styles.outlineButton, 
              { 
                borderColor: interpolateColor(
                  transitionProgress.value,
                  [0, 1],
                  [getTheme(false).border, getTheme(true).border]
                ),
                marginTop: 16 
              }
            ]}
            onPress={() => setShowFeedbackModal(true)}
          >
            <AnimatedText style={[styles.outlineButtonText, animatedText]}>
              Send Feedback
            </AnimatedText>
          </AnimatedTouchableOpacity>
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
            style={[styles.modalContent, modalContentStyle]}
          >
            <View style={styles.modalHeader}>
              <AnimatedText style={[styles.modalTitle, animatedText]}>
                Send Feedback
              </AnimatedText>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <AnimatedText style={[styles.label, animatedText]}>
                  Subject
                </AnimatedText>
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
                <AnimatedText style={[styles.label, animatedText]}>
                  Message
                </AnimatedText>
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
    </AnimatedView>
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