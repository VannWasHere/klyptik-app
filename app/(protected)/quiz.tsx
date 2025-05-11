import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { Component, ErrorInfo, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    SlideInRight,
    SlideOutLeft,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useQuiz } from '../context/QuizContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean, error: Error | null }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Quiz component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              this.setState({ hasError: false, error: null });
              router.replace('/(protected)/home');
            }}
          >
            <Text style={styles.errorButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get('window');

export default function Quiz() {
  const { 
    isLoading,
    questions,
    currentQuestionIndex,
    userAnswers,
    topic,
    quizTitle,
    score,
    quizInProgress,
    quizCompleted,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz
  } = useQuiz();
  
  const { isDark, animatedBackground, animatedText } = useTheme();
  const theme = getTheme(isDark);
  
  // Additional state for UI
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Animation values - initialize with default value 0 for safety
  const headerOpacity = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const questionOpacity = useSharedValue(0);
  const optionsOpacity = useSharedValue(0);
  
  // Reset UI state when current question changes
  useEffect(() => {
    setShowExplanation(false);
    
    try {
      // Animate question transition
      questionOpacity.value = 0;
      questionOpacity.value = withTiming(1, { duration: 500 });
      
      // Animate options transition
      optionsOpacity.value = 0;
      optionsOpacity.value = withTiming(1, { duration: 600 });
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, [currentQuestionIndex]);
  
  // Show results when quiz is completed
  useEffect(() => {
    if (quizCompleted) {
      setShowResults(true);
    }
  }, [quizCompleted]);
  
  // Initialize animations when component mounts
  useEffect(() => {
    try {
      // Start header animation
      headerOpacity.value = 0;
      headerOpacity.value = withTiming(1, { duration: 600 });
      
      // Start progress animation
      progressOpacity.value = 0;
      progressOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    } catch (error) {
      console.error('Animation initialization error:', error);
    }
  }, []);
  
  // Animation styles
  const headerStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: headerOpacity.value,
      };
    } catch (error) {
      console.error('Header animation style error:', error);
      return { opacity: 1 }; // Fallback to visible
    }
  });
  
  const progressStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: progressOpacity.value,
      };
    } catch (error) {
      console.error('Progress animation style error:', error);
      return { opacity: 1 }; // Fallback to visible
    }
  });
  
  const questionStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: questionOpacity.value,
      };
    } catch (error) {
      console.error('Question animation style error:', error);
      return { opacity: 1 }; // Fallback to visible
    }
  });
  
  const optionsStyle = useAnimatedStyle(() => {
    try {
      return {
        opacity: optionsOpacity.value,
      };
    } catch (error) {
      console.error('Options animation style error:', error);
      return { opacity: 1 }; // Fallback to visible
    }
  });
  
  // If no quiz is in progress, navigate to home
  useEffect(() => {
    if (!isLoading && !quizInProgress && !quizCompleted) {
      router.replace({
        pathname: '/(protected)/home'
      });
    }
  }, [isLoading, quizInProgress, quizCompleted]);
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading questions...
        </Text>
      </View>
    );
  }
  
  // Handle selecting an option
  const handleSelectOption = (option: string) => {
    try {
      // Register user's answer
      answerQuestion(option);
      // Show explanation
      setShowExplanation(true);
    } catch (error) {
      console.error('Error selecting option:', error);
      Toast.show({
        type: 'error',
        text1: 'Error selecting answer',
        position: 'bottom',
        visibilityTime: 2000
      });
    }
  };
  
  // Handle quiz completion
  const handleFinishQuiz = async () => {
    // Check if all questions are answered
    if (userAnswers.includes(null)) {
      Toast.show({
        type: 'error',
        text1: 'Please answer all questions',
        position: 'bottom',
        visibilityTime: 2000
      });
      return;
    }
    
    const result = await finishQuiz();
    if (result) {
      Toast.show({
        type: 'success',
        text1: 'Quiz completed!',
        text2: `Your score: ${score}/${questions.length}`,
        position: 'bottom',
        visibilityTime: 3000
      });
      setShowResults(true);
    }
  };
  
  // Start a new quiz
  const handleNewQuiz = () => {
    resetQuiz();
    router.replace({
      pathname: '/(protected)/quiz-setup'
    });
  };
  
  // Go back to home screen
  const handleBackToHome = () => {
    resetQuiz();
    router.replace({
      pathname: '/(protected)/home'
    });
  };
  
  // Render current question
  const renderQuestion = () => {
    // Safety check - make sure we have valid questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return (
        <View style={styles.questionContainer}>
          <Text style={[styles.questionText, { color: theme.text }]}>
            No questions available. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary, marginTop: 20 }]}
            onPress={handleBackToHome}
          >
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Safety check - make sure the current question exists
    if (!currentQuestion) {
      return (
        <View style={styles.questionContainer}>
          <Text style={[styles.questionText, { color: theme.text }]}>
            Question not found. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary, marginTop: 20 }]}
            onPress={handleBackToHome}
          >
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const userAnswer = userAnswers[currentQuestionIndex];
    const isAnswered = userAnswer !== null;
    
    // Make sure options are valid
    const options = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 
      ? currentQuestion.options 
      : ['Option A', 'Option B', 'Option C', 'Option D'];
    
    return (
      <View style={styles.questionContainer}>
        {/* Question */}
        <Animated.View 
          style={[styles.questionContent, questionStyle]}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}
        >
          <Text style={[styles.questionNumber, { color: theme.primary }]}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {currentQuestion.question || `Question ${currentQuestionIndex + 1}`}
          </Text>
        </Animated.View>
        
        {/* Options */}
        <Animated.View style={[styles.optionsContainer, optionsStyle]}>
          {Array.isArray(options) ? options.map((option, index) => (
            <AnimatedTouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border
                },
                userAnswer === option && { 
                  borderColor: theme.primary,
                  backgroundColor: isDark ? 'rgba(63, 81, 181, 0.2)' : 'rgba(63, 81, 181, 0.1)' 
                },
                showExplanation && option === currentQuestion.correctAnswer && {
                  borderColor: 'green',
                  backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'
                },
                showExplanation && userAnswer === option && option !== currentQuestion.correctAnswer && {
                  borderColor: 'red',
                  backgroundColor: isDark ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)'
                }
              ]}
              onPress={() => !isAnswered && handleSelectOption(option)}
              disabled={isAnswered}
              entering={FadeIn.delay(100 * index).duration(300)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>
                {option || `Option ${index + 1}`}
              </Text>
              
              {userAnswer === option && (
                <View style={styles.optionIcon}>
                  <Ionicons 
                    name={option === currentQuestion.correctAnswer ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={option === currentQuestion.correctAnswer ? "green" : "red"} 
                  />
                </View>
              )}
            </AnimatedTouchableOpacity>
          )) : (
            <Text style={[styles.errorText, { color: theme.error }]}>
              No options available for this question
            </Text>
          )}
        </Animated.View>
        
        {/* Explanation */}
        {showExplanation && (
          <Animated.View 
            style={[styles.explanationContainer, { 
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
            }]}
            entering={FadeIn.duration(300)}
          >
            <Text style={[styles.explanationTitle, { color: theme.primary }]}>Explanation:</Text>
            <Text style={[styles.explanationText, { color: theme.text }]}>
              {currentQuestion.explanation}
            </Text>
          </Animated.View>
        )}
        
        {/* Navigation buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton, 
              { backgroundColor: theme.card },
              currentQuestionIndex === 0 && styles.disabledButton
            ]}
            onPress={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons 
              name="arrow-back" 
              size={22} 
              color={currentQuestionIndex === 0 ? isDark ? '#666' : '#ccc' : theme.text} 
            />
            <Text style={[
              styles.navButtonText, 
              { color: theme.text },
              currentQuestionIndex === 0 && { color: isDark ? '#666' : '#ccc' }
            ]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton, 
                { backgroundColor: theme.card },
                !isAnswered && styles.disabledButton
              ]}
              onPress={nextQuestion}
              disabled={!isAnswered}
            >
              <Text style={[
                styles.navButtonText, 
                { color: theme.text },
                !isAnswered && { color: isDark ? '#666' : '#ccc' }
              ]}>
                Next
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={22} 
                color={!isAnswered ? isDark ? '#666' : '#ccc' : theme.text} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton, 
                { backgroundColor: theme.primary },
                !isAnswered && { 
                  backgroundColor: isDark ? '#333' : '#eee',
                  borderColor: isDark ? '#444' : '#ddd'
                }
              ]}
              onPress={handleFinishQuiz}
              disabled={!isAnswered}
            >
              <Text style={[
                styles.finishButtonText, 
                !isAnswered && { color: isDark ? '#666' : '#aaa' }
              ]}>
                Finish
              </Text>
              <Ionicons 
                name="checkmark-circle" 
                size={22} 
                color={!isAnswered ? isDark ? '#666' : '#aaa' : 'white'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  
  // Render results screen
  const renderResults = () => {
    const percentScore = Math.round((score / questions.length) * 100);
    let resultMessage = '';
    let resultIcon = '';
    
    if (percentScore >= 90) {
      resultMessage = 'Excellent!';
      resultIcon = 'trophy-outline';
    } else if (percentScore >= 70) {
      resultMessage = 'Great job!';
      resultIcon = 'ribbon-outline';
    } else if (percentScore >= 50) {
      resultMessage = 'Good effort!';
      resultIcon = 'thumbs-up-outline';
    } else {
      resultMessage = 'Keep practicing!';
      resultIcon = 'fitness-outline';
    }
    
    // Get displayed title in this order: quizTitle, topic name, or generic title
    const displayTitle = quizTitle || (topic ? `${topic} Quiz` : 'Quiz Results');
    
    // Safety check for questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return (
        <Animated.View 
          style={[styles.resultsContainer, { backgroundColor: theme.card }]}
          entering={FadeIn.duration(500)}
        >
          <Text style={[styles.topicTitle, { color: theme.text }]}>
            {displayTitle}
          </Text>
          
          <View style={styles.scoreContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={theme.primary} />
            <Text style={[styles.scoreText, { color: theme.primary }]}>
              {score}/0
            </Text>
            <Text style={[styles.resultMessage, { color: theme.text }]}>
              No questions were loaded
            </Text>
          </View>
          
          <View style={styles.resultButtons}>
            <TouchableOpacity 
              style={[styles.resultButton, { backgroundColor: theme.primary }]}
              onPress={handleBackToHome}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.resultButtonText}>
                Return Home
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }
    
    return (
      <Animated.View 
        style={[styles.resultsContainer, { backgroundColor: theme.card }]}
        entering={FadeIn.duration(500)}
      >
        <Text style={[styles.topicTitle, { color: theme.text }]}>
          {displayTitle}
        </Text>
        
        <View style={styles.scoreContainer}>
          <Ionicons name={resultIcon as any} size={60} color={theme.primary} />
          <Text style={[styles.scoreText, { color: theme.primary }]}>
            {score}/{questions.length}
          </Text>
          <Text style={[styles.percentText, { color: theme.text }]}>
            {percentScore}%
          </Text>
          <Text style={[styles.resultMessage, { color: theme.text }]}>
            {resultMessage}
          </Text>
        </View>
        
        <View style={styles.resultButtons}>
          <TouchableOpacity 
            style={[styles.resultButton, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={handleBackToHome}
          >
            <Ionicons name="home" size={20} color={theme.text} />
            <Text style={[styles.resultButtonText, { color: theme.text }]}>
              Home
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.resultButton, { backgroundColor: theme.primary }]}
            onPress={handleNewQuiz}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.resultButtonText}>
              New Quiz
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.answersTitle, { color: theme.text }]}>
          Your Answers:
        </Text>
        
        {/* Use a regular ScrollView instead of FlatList to avoid virtualization issues */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.answersList}
        >
          {questions.map((item, index) => (
            <View key={item.id.toString()} style={[styles.answerItem, { borderColor: theme.border }]}>
              <View style={styles.answerHeader}>
                <Text style={[styles.answerQuestion, { color: theme.text }]} numberOfLines={2}>
                  {item.question}
                </Text>
                <View style={[
                  styles.answerStatus, 
                  { 
                    backgroundColor: userAnswers[index] === item.correctAnswer 
                      ? 'rgba(76, 175, 80, 0.2)' 
                      : 'rgba(244, 67, 54, 0.2)' 
                  }
                ]}>
                  <Ionicons 
                    name={userAnswers[index] === item.correctAnswer ? "checkmark" : "close"} 
                    size={16} 
                    color={userAnswers[index] === item.correctAnswer ? "green" : "red"} 
                  />
                </View>
              </View>
              
              <View style={styles.answerDetail}>
                <Text style={[styles.answerLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  Your answer:
                </Text>
                <Text style={[
                  styles.answerText, 
                  { color: userAnswers[index] === item.correctAnswer ? "green" : "red" }
                ]}>
                  {userAnswers[index]}
                </Text>
              </View>
              
              <View style={styles.answerDetail}>
                <Text style={[styles.answerLabel, { color: isDark ? '#aaa' : '#666' }]}>
                  Correct answer:
                </Text>
                <Text style={[styles.answerText, { color: "green" }]}>
                  {item.correctAnswer}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };
  
  return (
    <ErrorBoundary>
      <Animated.View style={[styles.container, animatedBackground]}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackToHome}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.title, animatedText]}>
            Quiz
          </Animated.Text>
          
          {!showResults && (
            <Animated.View style={[styles.progressContainer, progressStyle]}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.primary,
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Main Content */}
        {showResults ? renderResults() : renderQuestion()}
      </Animated.View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 20,
    height: 30,
    justifyContent: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionContent: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 10,
  },
  explanationContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    minWidth: 120,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 5,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 5,
    color: 'white',
  },
  disabledButton: {
    opacity: 0.5,
  },
  resultsContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  topicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 15,
  },
  percentText: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 5,
  },
  resultMessage: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 10,
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    minWidth: 130,
    borderWidth: 1,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: 'white',
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
  },
  answersList: {
    paddingBottom: 20,
  },
  answerItem: {
    padding: 12,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  answerQuestion: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    paddingRight: 10,
  },
  answerStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 5,
  },
  answerDetail: {
    flexDirection: 'row',
    marginTop: 5,
  },
  answerLabel: {
    fontSize: 13,
    marginRight: 5,
  },
  answerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  startButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc3545',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#343a40',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#6c757d',
  },
  errorButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
}); 