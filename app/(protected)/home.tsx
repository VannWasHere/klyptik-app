import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getQuizHistory } from '../services/quizService';
import { getTheme } from '../theme/theme';

// Import the QuizDetailsModal component
// Use dynamic import to avoid circular dependencies
const QuizDetailsModal = require('../components/quiz/QuizDetailsModal').default;

// Create animated components
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Recent quiz data types
interface QuizResult {
  id: string;
  topic: string;
  score: string;
  percentage: number;
  date: string;
  completedAt: string;
  questionDetails: QuestionDetail[];
}

interface QuestionDetail {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

// Popular topics
const popularTopics = [
  { id: 1, name: 'React Native', icon: 'logo-react' },
  { id: 2, name: 'JavaScript', icon: 'logo-javascript' },
  { id: 3, name: 'Python', icon: 'logo-python' },
  { id: 4, name: 'Next.js', icon: 'code-slash-outline' },
  { id: 5, name: 'Machine Learning', icon: 'hardware-chip-outline' },
];

export default function Home() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, animatedBackground, animatedText, animatedCard } = useTheme();
  const theme = getTheme(isDark);
  
  // State
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);

  // Loading quiz history
  useEffect(() => {
    const fetchQuizHistory = async () => {
      if (user && user.uid) {
        setIsLoading(true);
        try {
          const history = await getQuizHistory(user.uid);
          setRecentQuizzes(history);
        } catch (error) {
          console.error('Failed to fetch quiz history:', error);
          Toast.show({
            type: 'error',
            text1: 'Error loading quiz history',
            position: 'bottom',
            visibilityTime: 3000
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchQuizHistory();
  }, [user]);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  
  // Setup initial animations
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    contentOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
  }, []);
  
  // Animated styles
  const headerStyle = useAnimatedStyle(() => {
    return { opacity: headerOpacity.value };
  });
  
  const contentStyle = useAnimatedStyle(() => {
    return { opacity: contentOpacity.value };
  });
  
  const iconStyle = useAnimatedStyle(() => {
    return { 
      transform: [{ rotate: `${iconRotation.value}deg` }]
    };
  });
  
  // Handle theme toggle with animation
  const handleThemeToggle = () => {
    // Rotate icon 180 degrees
    iconRotation.value = withTiming(iconRotation.value + 180, { 
      duration: 300, 
      easing: Easing.inOut(Easing.ease) 
    });
    
    toggleTheme();
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout failed',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  };
  
  // Navigate to quiz setup
  const navigateToQuizSetup = () => {
    router.push('/(protected)/quiz-setup');
  };
  
  // Start quiz with selected topic
  const startQuizWithTopic = (topic: string) => {
    router.push({
      pathname: '/(protected)/quiz-setup',
      params: { topic }
    });
  };
  
  // Open quiz details modal
  const handleQuizSelect = (quiz: QuizResult) => {
    setSelectedQuiz(quiz);
    setShowQuizDetails(true);
  };
  
  // Close quiz details modal
  const handleCloseDetails = () => {
    setShowQuizDetails(false);
    setSelectedQuiz(null);
  };
  
  return (
    <AnimatedView style={[styles.container, animatedBackground]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          <AnimatedText style={[styles.appTitle, animatedText]}>
            Klyptik
          </AnimatedText>
          
          <View style={styles.headerButtons}>
            <AnimatedTouchableOpacity 
              style={[styles.themeToggle, { backgroundColor: theme.card }]} 
              onPress={handleThemeToggle}
            >
              <Animated.View style={iconStyle}>
                <Ionicons 
                  name={isDark ? "sunny-outline" : "moon-outline"} 
                  size={24} 
                  color={theme.text} 
                />
              </Animated.View>
            </AnimatedTouchableOpacity>
            
            <AnimatedTouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: theme.card }]} 
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
            <View style={styles.sectionHeader}>
              <AnimatedText style={[styles.sectionTitle, animatedText]}>
                Recent Quizzes
              </AnimatedText>
              {recentQuizzes.length > 3 && (
                <TouchableOpacity onPress={() => setShowAllQuizzes(!showAllQuizzes)}>
                  <Text style={[styles.viewAllText, { color: theme.primary }]}>
                    {showAllQuizzes ? 'Show Less' : 'View All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>Loading quiz history...</Text>
              </View>
            ) : recentQuizzes.length > 0 ? (
              <View style={{ maxHeight: showAllQuizzes ? undefined : 300 }}>
                <ScrollView 
                  horizontal={false}
                  showsVerticalScrollIndicator={showAllQuizzes}
                  contentContainerStyle={styles.recentQuizzesContainer}
                  nestedScrollEnabled={true}
                >
                  {(showAllQuizzes ? recentQuizzes : recentQuizzes).map(quiz => (
                    <TouchableOpacity 
                      key={quiz.id}
                      style={[
                        styles.quizCard, 
                        { backgroundColor: theme.card }
                      ]}
                      onPress={() => handleQuizSelect(quiz)}
                    >
                      <View style={styles.quizInfo}>
                        <AnimatedText style={[styles.quizTitle, animatedText]}>
                          {quiz.topic}
                        </AnimatedText>
                        <AnimatedText style={[styles.quizDate, { color: isDark ? '#aaa' : '#666' }]}>
                          {quiz.date}
                        </AnimatedText>
                      </View>
                      <View style={styles.quizScoreContainer}>
                        <AnimatedText style={[styles.scoreText, { color: theme.primary }]}>
                          {quiz.score}
                        </AnimatedText>
                        <View style={[styles.percentageBadge, { 
                          backgroundColor: quiz.percentage >= 70 ? '#4caf50' : 
                                            quiz.percentage >= 40 ? '#ff9800' : '#f44336' 
                        }]}>
                          <Text style={styles.percentageText}>{quiz.percentage}%</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                <Ionicons name="document-text-outline" size={32} color={theme.text} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyStateText, { color: theme.text }]}>
                  No quizzes taken yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: isDark ? '#aaa' : '#666' }]}>
                  Create a new quiz to get started
                </Text>
              </View>
            )}
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
      
      {/* Quiz Details Modal */}
      <QuizDetailsModal
        visible={showQuizDetails}
        quiz={selectedQuiz}
        onClose={handleCloseDetails}
        theme={theme}
        isDark={isDark}
      />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentQuizzesContainer: {
    paddingBottom: 10,
  },
  quizCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
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
  quizScoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  percentageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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