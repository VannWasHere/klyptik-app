import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
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

// Recent quiz data - this would come from an API in a real app
const recentQuizzes = [
  { id: 1, title: 'React Native Basics', score: '8/10', date: '2 days ago' },
  { id: 2, title: 'JavaScript Fundamentals', score: '7/10', date: '1 week ago' },
  { id: 3, title: 'CSS Grid & Flexbox', score: '9/10', date: '2 weeks ago' },
];

// Popular topics
const popularTopics = [
  { id: 1, name: 'React Native', icon: 'logo-react' },
  { id: 2, name: 'JavaScript', icon: 'logo-javascript' },
  { id: 3, name: 'Python', icon: 'logo-python' },
  { id: 4, name: 'Next.js', icon: 'code-slash-outline' },
  { id: 5, name: 'Machine Learning', icon: 'hardware-chip-outline' },
];

export default function Home() {
  const { isDark, toggleTheme, animatedBackground, animatedText, animatedCard, transitionProgress } = useTheme();
  const { user, logout } = useAuth();
  const theme = getTheme(isDark);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const themeIconRotation = useSharedValue(0);
  const themeToggleScale = useSharedValue(1);
  
  // Initialize animations
  useEffect(() => {
    // Sequence the animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    contentOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
  }, []);
  
  // Animation styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));
  
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: (1 - contentOpacity.value) * 20 }]
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

  const navigateToQuizSetup = () => {
    router.push('/quiz-setup');
  };
  
  const startQuizWithTopic = (topic: string) => {
    router.push({
      pathname: '/quiz-setup',
      params: { topic }
    });
  };
  
  return (
    <AnimatedView style={[styles.container, animatedBackground]}>
      <Animated.View 
        style={[styles.header, headerStyle]}
      >
        <View style={styles.headerContent}>
          <AnimatedText style={[styles.appTitle, animatedText]}>
            Klyptik Quiz
          </AnimatedText>
          
          <View style={styles.headerButtons}>
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
          </View>
        </View>
        
        <AnimatedText style={[styles.welcomeText, animatedText]}>
          {user && user.display_name ? `Hello, ${user.display_name}!` : 'Welcome!'}
        </AnimatedText>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          {/* New Quiz Button */}
          <TouchableOpacity 
            style={[styles.newQuizButton, { backgroundColor: theme.primary }]}
            onPress={navigateToQuizSetup}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.newQuizText}>Create New Quiz</Text>
          </TouchableOpacity>
          
          {/* Recent Quizzes Section */}
          <View style={styles.section}>
            <AnimatedText style={[styles.sectionTitle, animatedText]}>
              Recent Quizzes
            </AnimatedText>
            
            {recentQuizzes.map(quiz => (
              <TouchableOpacity 
                key={quiz.id}
                style={[styles.quizCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.quizInfo}>
                  <AnimatedText style={[styles.quizTitle, animatedText]}>
                    {quiz.title}
                  </AnimatedText>
                  <AnimatedText style={[styles.quizDate, { color: isDark ? '#aaa' : '#666' }]}>
                    {quiz.date}
                  </AnimatedText>
                </View>
                <View style={styles.quizScore}>
                  <AnimatedText style={[styles.scoreText, { color: theme.primary }]}>
                    {quiz.score}
                  </AnimatedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Popular Topics Section */}
          <View style={styles.section}>
            <AnimatedText style={[styles.sectionTitle, animatedText]}>
              Popular Topics
            </AnimatedText>
            
            <View style={styles.topicsGrid}>
              {popularTopics.map(topic => (
                <TouchableOpacity 
                  key={topic.id}
                  style={[styles.topicCard, { backgroundColor: theme.card }]}
                  onPress={() => startQuizWithTopic(topic.name)}
                >
                  <Ionicons name={topic.icon as any} size={32} color={theme.primary} />
                  <AnimatedText style={[styles.topicName, animatedText]}>
                    {topic.name}
                  </AnimatedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  themeToggle: {
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 30,
  },
  welcomeText: {
    fontSize: 18,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  newQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  newQuizText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quizCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  quizDate: {
    fontSize: 14,
  },
  quizScore: {
    paddingLeft: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    height: 100,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
}); 