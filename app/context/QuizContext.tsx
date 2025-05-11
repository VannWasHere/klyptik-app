import React, { createContext, ReactNode, useContext, useState } from 'react';
import Toast from 'react-native-toast-message';
import { generateQuizQuestions, saveQuizResults } from '../services/quizService';
import { useAuth } from './AuthContext';

// Define question type
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Define quiz context state
interface QuizContextState {
  isLoading: boolean;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: (string | null)[];
  topic: string | null;
  quizTitle: string | null;
  score: number;
  
  // Methods
  startQuiz: (topic: string, numberOfQuestions: number) => Promise<void>;
  answerQuestion: (answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuiz: () => Promise<boolean>;
  resetQuiz: () => void;
  
  // Quiz progress
  quizInProgress: boolean;
  quizCompleted: boolean;
}

// Create context
const QuizContext = createContext<QuizContextState | undefined>(undefined);

// Provider component
export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Calculate score based on correct answers
  const score = userAnswers.reduce((total, answer, index) => {
    if (answer === questions[index]?.correctAnswer) {
      return total + 1;
    }
    return total;
  }, 0);

  // Start a new quiz
  const startQuiz = async (selectedTopic: string, numberOfQuestions: number) => {
    setIsLoading(true);
    setTopic(selectedTopic);
    
    try {
      // Get questions from service
      const quizQuestions = await generateQuizQuestions(selectedTopic, numberOfQuestions);
      
      // Safety check - if no questions were returned, show error and return
      if (!quizQuestions || quizQuestions.length === 0) {
        console.error('No quiz questions returned');
        Toast.show({
          type: 'error',
          text1: 'Error loading quiz',
          text2: 'Could not load questions. Please try again.',
          position: 'bottom',
          visibilityTime: 3000
        });
        setIsLoading(false);
        return;
      }
      
      // Initialize state
      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers(new Array(quizQuestions.length).fill(null));
      setQuizInProgress(true);
      setQuizCompleted(false);
      
      // Generate a title if one wasn't provided
      setQuizTitle(generateTitle(selectedTopic));
    } catch (error) {
      console.error('Failed to start quiz:', error);
      Toast.show({
        type: 'error',
        text1: 'Error starting quiz',
        text2: 'Please try again',
        position: 'bottom',
        visibilityTime: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a default title based on topic
  const generateTitle = (topicText: string): string => {
    // If topic ends with "Quiz", don't duplicate
    if (topicText.toLowerCase().endsWith('quiz')) {
      return topicText;
    }
    
    // Check if topic has grammatically correct format
    if (topicText.toLowerCase().includes('fundamentals') || 
        topicText.toLowerCase().includes('basics') ||
        topicText.toLowerCase().includes('advanced')) {
      return `${topicText} Quiz`;
    }
    
    // Default format
    return `${topicText} Fundamentals Quiz`;
  };
  
  // Answer current question
  const answerQuestion = (answer: string) => {
    try {
      // Safety check - make sure we have valid questions and current index
      if (!questions || questions.length === 0 || currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
        console.error('Invalid question state during answer');
        Toast.show({
          type: 'error',
          text1: 'Error submitting answer',
          text2: 'There was a problem with the quiz state',
          position: 'bottom',
          visibilityTime: 3000
        });
        return;
      }
      
      if (!answer) {
        console.error('Received empty answer');
        return;
      }
      
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = answer;
      setUserAnswers(newAnswers);
    } catch (error) {
      console.error('Error in answerQuestion:', error);
      Toast.show({
        type: 'error',
        text1: 'Error submitting answer',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  };
  
  // Navigate to next question
  const nextQuestion = () => {
    try {
      // Safety check
      if (!questions || questions.length === 0) return;
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentQuestionIndex === questions.length - 1 && !userAnswers.includes(null)) {
        // Auto-complete quiz if all questions are answered and we try to go past the last question
        setQuizCompleted(true);
      }
    } catch (error) {
      console.error('Error navigating to next question:', error);
    }
  };
  
  // Navigate to previous question
  const previousQuestion = () => {
    try {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    } catch (error) {
      console.error('Error navigating to previous question:', error);
    }
  };
  
  // Finish quiz and save results
  const finishQuiz = async () => {
    // Only finish if all questions answered
    if (userAnswers.includes(null)) {
      return false;
    }
    
    setQuizCompleted(true);
    
    // Save results if we have a user
    if (user && user.uid && topic) {
      try {
        await saveQuizResults(user.uid, topic, score, questions.length);
        return true;
      } catch (error) {
        console.error('Failed to save quiz results:', error);
        return false;
      }
    }
    
    return true;
  };
  
  // Reset quiz state
  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTopic(null);
    setQuizTitle(null);
    setQuizInProgress(false);
    setQuizCompleted(false);
  };
  
  // Context value
  const value: QuizContextState = {
    isLoading,
    questions,
    currentQuestionIndex,
    userAnswers,
    topic,
    quizTitle,
    score,
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishQuiz,
    resetQuiz,
    quizInProgress,
    quizCompleted
  };
  
  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

// Custom hook for using Quiz context
export const useQuiz = (): QuizContextState => {
  const context = useContext(QuizContext);
  
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  
  return context;
}; 