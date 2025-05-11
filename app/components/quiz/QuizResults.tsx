import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { QuizQuestion } from '../../services/quizService';

interface QuizResultsProps {
  topic: string | null;
  quizTitle: string | null;
  questions: QuizQuestion[];
  userAnswers: (string | null)[];
  score: number;
  theme: any;
  isDark: boolean;
  onHomePress: () => void;
  onNewQuizPress: () => void;
  onDetailedReportPress: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  topic,
  quizTitle,
  questions,
  userAnswers,
  score,
  theme,
  isDark,
  onHomePress,
  onNewQuizPress,
  onDetailedReportPress
}) => {
  // Calculate percentage score
  const percentScore = Math.round((score / questions.length) * 100);
  
  // Determine result message and icon based on score
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
            onPress={onHomePress}
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
          onPress={onHomePress}
        >
          <Ionicons name="home" size={20} color={theme.text} />
          <Text style={[styles.resultButtonText, { color: theme.text }]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.resultButton, { backgroundColor: theme.primary }]}
          onPress={onNewQuizPress}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.resultButtonText}>
            New Quiz
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.detailedReportButton, { 
          backgroundColor: isDark ? 'rgba(63, 81, 181, 0.2)' : 'rgba(63, 81, 181, 0.1)',
          borderColor: theme.primary 
        }]}
        onPress={onDetailedReportPress}
      >
        <Ionicons name="bar-chart-outline" size={20} color={theme.primary} />
        <Text style={[styles.detailedReportText, { color: theme.primary }]}>
          View Detailed Report
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.answersTitle, { color: theme.text }]}>
        Your Answers:
      </Text>
      
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

const styles = StyleSheet.create({
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
  detailedReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    alignSelf: 'center',
  },
  detailedReportText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
});

export default QuizResults; 