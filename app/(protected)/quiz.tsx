import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useQuiz } from '../context/QuizContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Import modular components
import DetailedReportModal from '../components/quiz/DetailedReportModal';
import ErrorBoundary from '../components/quiz/ErrorBoundary';
import QuizHeader from '../components/quiz/QuizHeader';
import QuizNavigation from '../components/quiz/QuizNavigation';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';

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
  
  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const questionOpacity = useSharedValue(0);
  const optionsOpacity = useSharedValue(0);
  
  // Animation styles
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value || 1
    };
  });
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      opacity: progressOpacity.value || 1
    };
  });
  
  const questionStyle = useAnimatedStyle(() => {
    return {
      opacity: questionOpacity.value || 1
    };
  });
  
  const optionsStyle = useAnimatedStyle(() => {
    return {
      opacity: optionsOpacity.value || 1
    };
  });
  
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
  
  // If no quiz is in progress, navigate to home
  useEffect(() => {
    if (!isLoading && !quizInProgress && !quizCompleted) {
      router.replace({
        pathname: '/(protected)/home'
      });
    }
  }, [isLoading, quizInProgress, quizCompleted]);
  
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
  
  // Render loading state
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
  
  // Safety check - make sure questions are valid
  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = userAnswers[currentQuestionIndex] !== null;
  
  return (
    <ErrorBoundary>
      <Animated.View style={[styles.container, animatedBackground]}>
        {/* Header */}
        <QuizHeader
          showProgress={!showResults}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          theme={theme}
          animatedText={animatedText}
          headerStyle={headerStyle}
          progressStyle={progressStyle}
          onBackPress={handleBackToHome}
        />
        
        {/* Main Content */}
        {showResults ? (
          <QuizResults
            topic={topic}
            quizTitle={quizTitle}
            questions={questions}
            userAnswers={userAnswers}
            score={score}
            theme={theme}
            isDark={isDark}
            onHomePress={handleBackToHome}
            onNewQuizPress={handleNewQuiz}
            onDetailedReportPress={() => setShowDetailedReport(true)}
          />
        ) : (
          <View style={styles.questionContainer}>
            {/* Render Question */}
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                userAnswer={userAnswers[currentQuestionIndex]}
                showExplanation={showExplanation}
                theme={theme}
                isDark={isDark}
                questionStyle={questionStyle}
                optionsStyle={optionsStyle}
                handleSelectOption={handleSelectOption}
              />
            )}
            
            {/* Navigation buttons */}
            <QuizNavigation
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              isAnswered={isAnswered}
              theme={theme}
              isDark={isDark}
              onPrevious={previousQuestion}
              onNext={nextQuestion}
              onFinish={handleFinishQuiz}
            />
          </View>
        )}
        
        {/* Detailed Report Modal */}
        <DetailedReportModal
          visible={showDetailedReport}
          onClose={() => setShowDetailedReport(false)}
          topic={topic}
          questions={questions}
          userAnswers={userAnswers}
          score={score}
          theme={theme}
          isDark={isDark}
        />
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
  questionContainer: {
    flex: 1,
    padding: 20,
  },
}); 