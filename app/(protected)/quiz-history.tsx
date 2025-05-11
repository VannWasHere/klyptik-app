import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import QuizDetailsModal from '../components/quiz/QuizDetailsModal';
import ContrastHeader from '../components/ui/ContrastHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAllQuizHistory } from '../services/quizService';
import { getTheme } from '../theme/theme';

// Define quiz result type
interface QuizResult {
  id: string;
  topic: string;
  score: string;
  percentage: number;
  date: string;
  time: string;
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

export default function QuizHistory() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  
  useEffect(() => {
    const fetchQuizHistory = async () => {
      if (user?.uid) {
        try {
          const results = await getAllQuizHistory(user.uid);
          setQuizResults(results);
        } catch (error) {
          console.error('Failed to fetch quiz history:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchQuizHistory();
  }, [user]);
  
  const handleQuizSelect = (quiz: QuizResult) => {
    setSelectedQuiz(quiz);
    setShowQuizDetails(true);
  };
  
  const renderQuizItem = ({ item }: { item: QuizResult }) => (
    <Animated.View 
      entering={FadeIn.duration(400).delay(100)}
      style={styles.quizItemContainer}
    >
      <TouchableOpacity
        style={[styles.quizCard, { backgroundColor: theme.card }]}
        onPress={() => handleQuizSelect(item)}
      >
        <View style={styles.quizHeader}>
          <Text style={[styles.quizTopic, { color: theme.text }]}>{item.topic}</Text>
          <View style={[styles.percentageBadge, { 
            backgroundColor: item.percentage >= 70 ? '#4caf50' : 
                            item.percentage >= 40 ? '#ff9800' : '#f44336' 
          }]}>
            <Text style={styles.percentageText}>{item.percentage}%</Text>
          </View>
        </View>
        
        <View style={styles.quizInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>Score: {item.score}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{item.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{item.time}</Text>
          </View>
        </View>
        
        <View style={[styles.viewDetailsRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
            View Details
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading quiz history...</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ContrastHeader title="Quiz History" />
      
      {quizResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.text} style={{ opacity: 0.3 }} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No quiz history found</Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#aaa' : '#666' }]}>
            Complete a quiz to see your history
          </Text>
        </View>
      ) : (
        <FlatList
          data={quizResults}
          renderItem={renderQuizItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <QuizDetailsModal
        visible={showQuizDetails}
        quiz={selectedQuiz}
        onClose={() => setShowQuizDetails(false)}
        theme={theme}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  quizItemContainer: {
    marginBottom: 16,
  },
  quizCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  quizTopic: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quizInfo: {
    padding: 16,
    paddingTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 