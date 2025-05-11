import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { QuizQuestion as QuizQuestionType } from '../../services/quizService';

// Define props interface
interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  userAnswer: string | null;
  showExplanation: boolean;
  theme: any;
  isDark: boolean;
  questionStyle: any;
  optionsStyle: any;
  handleSelectOption: (option: string) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  userAnswer,
  showExplanation,
  theme,
  isDark,
  questionStyle,
  optionsStyle,
  handleSelectOption
}) => {
  const isAnswered = userAnswer !== null;
  
  // Make sure options are valid
  const options = Array.isArray(question.options) && question.options.length > 0 
    ? question.options 
    : ['Option A', 'Option B', 'Option C', 'Option D'];
  
  return (
    <View style={styles.container}>
      {/* Question */}
      <Animated.View 
        style={[styles.questionContent, questionStyle]}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
      >
        <Text style={[styles.questionNumber, { color: theme.primary }]}>
          Question {questionIndex + 1} of {totalQuestions}
        </Text>
        <Text style={[styles.questionText, { color: theme.text }]}>
          {question.question || `Question ${questionIndex + 1}`}
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
                showExplanation && option === question.correctAnswer && {
                  borderColor: 'green',
                  backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)'
                },
                showExplanation && userAnswer === option && option !== question.correctAnswer && {
                  borderColor: 'red',
                  backgroundColor: isDark ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)'
                }
              ]}
              onPress={() => !isAnswered && handleSelectOption(option)}
              disabled={isAnswered}
              entering={FadeIn.delay(100 * index).duration(300)}
            >
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {option || `Option ${index + 1}`}
                </Text>
              </View>
              
              {userAnswer === option && (
                <View style={styles.optionIcon}>
                  <Ionicons 
                    name={option === question.correctAnswer ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={option === question.correctAnswer ? "green" : "red"} 
                  />
                </View>
              )}
            </AnimatedTouchableOpacity>
          )) : (
          <Text style={[styles.errorText, { color: theme.error || '#dc3545' }]}>
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
            {question.explanation}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
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
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default QuizQuestion; 