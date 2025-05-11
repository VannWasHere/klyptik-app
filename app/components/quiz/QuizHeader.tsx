import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface QuizHeaderProps {
  showProgress: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  theme: any;
  animatedText: any;
  headerStyle: any;
  progressStyle: any;
  onBackPress: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  showProgress,
  currentQuestionIndex,
  totalQuestions,
  theme,
  animatedText,
  headerStyle,
  progressStyle,
  onBackPress
}) => {
  return (
    <Animated.View style={[styles.header, headerStyle]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={onBackPress}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <Animated.Text style={[styles.title, animatedText]}>
        Quiz
      </Animated.Text>
      
      {showProgress && (
        <Animated.View style={[styles.progressContainer, progressStyle]}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.primary,
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` 
                }
              ]} 
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
});

export default QuizHeader; 