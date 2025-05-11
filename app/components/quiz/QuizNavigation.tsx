import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuizNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isAnswered: boolean;
  theme: any;
  isDark: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  theme,
  isDark,
  onPrevious,
  onNext,
  onFinish
}) => {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
  return (
    <View style={styles.navigationButtons}>
      {/* Previous Button */}
      <TouchableOpacity
        style={[
          styles.navButton, 
          { backgroundColor: theme.card },
          currentQuestionIndex === 0 && styles.disabledButton
        ]}
        onPress={onPrevious}
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
      
      {/* Next or Finish Button */}
      {!isLastQuestion ? (
        <TouchableOpacity
          style={[
            styles.navButton, 
            { backgroundColor: theme.card },
            !isAnswered && styles.disabledButton
          ]}
          onPress={onNext}
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
          onPress={onFinish}
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
  );
};

const styles = StyleSheet.create({
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
});

export default QuizNavigation; 