import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Define the QuestionDetail interface
interface QuestionDetail {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

// Define the QuizResult interface
interface QuizResult {
  id: string;
  topic: string;
  score: string;
  percentage: number;
  date: string;
  completedAt: string;
  questionDetails: QuestionDetail[];
}

// Define props for the QuizDetailsModal component
interface QuizDetailsModalProps {
  visible: boolean;
  quiz: QuizResult | null;
  onClose: () => void;
  theme: any;
  isDark: boolean;
}

const QuizDetailsModal: React.FC<QuizDetailsModalProps> = ({
  visible,
  quiz,
  onClose,
  theme,
  isDark
}) => {
  if (!visible || !quiz) return null;
  
  // Format the completed date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[styles.modalContent, { backgroundColor: theme.card }]}
          entering={FadeIn.duration(300)}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Quiz Details
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.detailsScroll}
            contentContainerStyle={styles.detailsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>Topic:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{quiz.topic}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>Date:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {formatDate(quiz.completedAt)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.text }]}>Score:</Text>
                <Text style={[styles.summaryValue, { color: theme.primary, fontWeight: 'bold' }]}>
                  {quiz.score} ({quiz.percentage}%)
                </Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Questions
            </Text>
            
            {quiz.questionDetails.map((question, index) => (
              <View 
                key={`question-${index}`}
                style={[
                  styles.questionCard,
                  { 
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderLeftColor: question.isCorrect ? 'green' : 'red',
                  }
                ]}
              >
                <View style={styles.questionHeader}>
                  <Text style={[styles.questionNumber, { color: theme.text }]}>
                    Question {index + 1}
                  </Text>
                  <View style={[
                    styles.resultBadge, 
                    { backgroundColor: question.isCorrect ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)' }
                  ]}>
                    <Ionicons 
                      name={question.isCorrect ? "checkmark-circle" : "close-circle"} 
                      size={14} 
                      color={question.isCorrect ? "green" : "red"} 
                      style={styles.resultIcon}
                    />
                    <Text style={[
                      styles.resultText, 
                      { color: question.isCorrect ? "green" : "red" }
                    ]}>
                      {question.isCorrect ? "Correct" : "Incorrect"}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.questionText, { color: theme.text }]}>
                  {question.question}
                </Text>
                
                <View style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => (
                    <View 
                      key={`option-${optionIndex}`}
                      style={[
                        styles.optionItem,
                        { 
                          backgroundColor: 
                            option === question.correctAnswer 
                              ? 'rgba(76, 175, 80, 0.1)' 
                              : option === question.userAnswer && option !== question.correctAnswer
                                ? 'rgba(244, 67, 54, 0.1)'
                                : 'transparent',
                          borderColor: 
                            option === question.correctAnswer 
                              ? 'green' 
                              : option === question.userAnswer && option !== question.correctAnswer
                                ? 'red'
                                : theme.border
                        }
                      ]}
                    >
                      <Text style={[
                        styles.optionText, 
                        { 
                          color: 
                            option === question.correctAnswer 
                              ? 'green' 
                              : option === question.userAnswer && option !== question.correctAnswer
                                ? 'red'
                                : theme.text,
                          fontWeight: 
                            option === question.correctAnswer || option === question.userAnswer 
                              ? '500' 
                              : 'normal'
                        }
                      ]}>
                        {option}
                        {option === question.userAnswer && ' (Your Answer)'}
                        {option === question.correctAnswer && option !== question.userAnswer && ' (Correct)'}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.explanationBox}>
                  <Text style={[styles.explanationText, { color: theme.text }]}>
                    {question.isCorrect 
                      ? 'Great job! You selected the correct answer.' 
                      : `The correct answer is "${question.correctAnswer}".`}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.closeModalButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  detailsScroll: {
    maxHeight: '80%',
  },
  detailsContent: {
    paddingBottom: 20,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  summaryValue: {
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  questionCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultIcon: {
    marginRight: 4,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 15,
  },
  optionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  explanationBox: {
    marginTop: 5,
  },
  explanationText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  closeModalButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default QuizDetailsModal; 