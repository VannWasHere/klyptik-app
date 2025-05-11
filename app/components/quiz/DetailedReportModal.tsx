import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { QuizQuestion } from '../../services/quizService';

interface DetailedReportModalProps {
  visible: boolean;
  onClose: () => void;
  topic: string | null;
  questions: QuizQuestion[];
  userAnswers: (string | null)[];
  score: number;
  theme: any;
  isDark: boolean;
}

const DetailedReportModal: React.FC<DetailedReportModalProps> = ({
  visible,
  onClose,
  topic,
  questions,
  userAnswers,
  score,
  theme,
  isDark
}) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <Animated.View 
        style={[styles.modalContent, { backgroundColor: theme.card }]}
        entering={FadeIn.duration(300)}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Detailed Quiz Report
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.detailedReportScroll}
          contentContainerStyle={styles.detailedReportContent}
        >
          <View style={styles.reportSummary}>
            <Text style={[styles.reportLabel, { color: theme.text }]}>Topic:</Text>
            <Text style={[styles.reportValue, { color: theme.text }]}>{topic}</Text>
          </View>
          
          <View style={styles.reportSummary}>
            <Text style={[styles.reportLabel, { color: theme.text }]}>Date:</Text>
            <Text style={[styles.reportValue, { color: theme.text }]}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.reportSummary}>
            <Text style={[styles.reportLabel, { color: theme.text }]}>Score:</Text>
            <Text style={[styles.reportValue, { color: theme.primary, fontWeight: 'bold' }]}>
              {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <Text style={[styles.questionSectionTitle, { color: theme.text }]}>
            Question Analysis
          </Text>
          
          {questions.map((question, index) => {
            const isCorrect = userAnswers[index] === question.correctAnswer;
            return (
              <View 
                key={`question-${index}`} 
                style={[
                  styles.questionAnalysis,
                  { 
                    borderLeftColor: isCorrect ? 'green' : 'red',
                    backgroundColor: isDark 
                      ? isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' 
                      : isCorrect ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)' 
                  }
                ]}
              >
                <View style={styles.questionResult}>
                  <Ionicons 
                    name={isCorrect ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={isCorrect ? "green" : "red"} 
                    style={styles.resultIcon}
                  />
                  <Text style={[styles.resultText, { color: isCorrect ? "green" : "red" }]}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </Text>
                </View>
                
                <Text style={[styles.analysisQuestion, { color: theme.text }]}>
                  {index + 1}. {question.question}
                </Text>
                
                <View style={styles.optionAnalysis}>
                  {question.options.map((option, optionIndex) => (
                    <View 
                      key={`option-${optionIndex}`}
                      style={[
                        styles.analysisPill,
                        { 
                          backgroundColor: 
                            option === question.correctAnswer 
                              ? 'rgba(76, 175, 80, 0.2)' 
                              : option === userAnswers[index] && option !== question.correctAnswer
                                ? 'rgba(244, 67, 54, 0.2)'
                                : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                          borderColor: 
                            option === question.correctAnswer 
                              ? 'green' 
                              : option === userAnswers[index] && option !== question.correctAnswer
                                ? 'red'
                                : theme.border
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.pillText, 
                          { 
                            color: 
                              option === question.correctAnswer 
                                ? 'green' 
                                : option === userAnswers[index] && option !== question.correctAnswer
                                  ? 'red'
                                  : theme.text
                          }
                        ]}
                      >
                        {option}
                        {option === userAnswers[index] && ' (Your Answer)'}
                        {option === question.correctAnswer && option !== userAnswers[index] && ' (Correct Answer)'}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.explanationBox}>
                  <Text style={[styles.explanationHeader, { color: theme.primary }]}>
                    Explanation:
                  </Text>
                  <Text style={[styles.explanationDetail, { color: theme.text }]}>
                    {question.explanation}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        
        <TouchableOpacity 
          style={[styles.closeModalButton, { backgroundColor: theme.primary }]}
          onPress={onClose}
        >
          <Text style={styles.closeModalText}>Close Report</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
  detailedReportScroll: {
    maxHeight: '80%',
  },
  detailedReportContent: {
    paddingBottom: 20,
  },
  reportSummary: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reportLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  reportValue: {
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  questionSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  questionAnalysis: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
  },
  questionResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultIcon: {
    marginRight: 5,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  analysisQuestion: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
  },
  optionAnalysis: {
    marginBottom: 15,
  },
  analysisPill: {
    padding: 10,
    borderRadius: 25,
    marginBottom: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
  },
  explanationBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  explanationHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  explanationDetail: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeModalButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DetailedReportModal; 