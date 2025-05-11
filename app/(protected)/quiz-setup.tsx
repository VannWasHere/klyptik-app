import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useQuiz } from '../context/QuizContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

// Topic options - maps to the topics in quizService
const topicOptions = [
  { id: 'react-native', name: 'React Native', icon: 'logo-react' },
  { id: 'javascript', name: 'JavaScript', icon: 'logo-javascript' },
  { id: 'python', name: 'Python', icon: 'logo-python' },
  { id: 'next', name: 'Next.js', icon: 'code-slash-outline' },
  { id: 'ml', name: 'Machine Learning', icon: 'hardware-chip-outline' },
  { id: 'custom', name: 'Custom Topic', icon: 'create-outline' }
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function QuizSetup() {
  const params = useLocalSearchParams<{ topic?: string }>();
  const { isDark, animatedBackground, animatedText } = useTheme();
  const { startQuiz, isLoading } = useQuiz();
  const theme = getTheme(isDark);
  
  // State for form
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  
  // Initialize animations
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    formOpacity.value = withTiming(1, { duration: 800 });
  }, []);
  
  // Set topic from params if available
  useEffect(() => {
    if (params.topic) {
      const matchingTopic = topicOptions.find(
        option => option.name.toLowerCase() === params.topic?.toLowerCase()
      );
      
      if (matchingTopic) {
        setSelectedTopic(matchingTopic.name);
      } else {
        // If not a predefined topic, set as custom
        setSelectedTopic('Custom Topic');
        setCustomTopic(params.topic || '');
        setShowCustomInput(true);
      }
    }
  }, [params.topic]);
  
  // Animation styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));
  
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value
  }));
  
  // Handle topic selection
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    if (topic === 'Custom Topic') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
  };
  
  // Start quiz with current settings
  const handleStartQuiz = async () => {
    // Validate inputs
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }
    
    if (selectedTopic === 'Custom Topic' && !customTopic.trim()) {
      alert('Please enter a custom topic');
      return;
    }
    
    const questionsCount = parseInt(numberOfQuestions, 10);
    if (isNaN(questionsCount) || questionsCount < 1 || questionsCount > 20) {
      alert('Please enter a valid number of questions (1-20)');
      return;
    }
    
    // Get the actual topic to use
    const actualTopic = selectedTopic === 'Custom Topic' ? customTopic : selectedTopic;
    
    // Start the quiz using the QuizContext
    await startQuiz(actualTopic, questionsCount);
    
    // Navigate to the quiz page
    router.push({
      pathname: '/(protected)/quiz'
    });
  };
  
  // Navigate back
  const handleBack = () => {
    router.back();
  };
  
  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Animated.Text style={[styles.title, animatedText]}>
          Create Quiz
        </Animated.Text>
      </Animated.View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.form, formStyle]}>
          {/* Topic Selection */}
          <Animated.Text style={[styles.sectionTitle, animatedText]}>
            Select Topic
          </Animated.Text>
          
          <View style={styles.topicGrid}>
            {topicOptions.map((topic) => (
              <AnimatedTouchableOpacity
                key={topic.id}
                style={[
                  styles.topicCard,
                  { backgroundColor: theme.card },
                  selectedTopic === topic.name && styles.selectedTopicCard,
                  selectedTopic === topic.name && { borderColor: theme.primary }
                ]}
                onPress={() => handleSelectTopic(topic.name)}
                entering={FadeIn.delay(200 * topicOptions.indexOf(topic)).duration(300)}
              >
                <Ionicons 
                  name={topic.icon as any} 
                  size={30} 
                  color={selectedTopic === topic.name ? theme.primary : theme.text} 
                />
                <Text 
                  style={[
                    styles.topicName, 
                    { color: theme.text },
                    selectedTopic === topic.name && { color: theme.primary }
                  ]}
                >
                  {topic.name}
                </Text>
              </AnimatedTouchableOpacity>
            ))}
          </View>
          
          {/* Custom Topic Input */}
          {showCustomInput && (
            <Animated.View 
              style={styles.customTopicContainer}
              entering={SlideInRight.duration(300)}
              exiting={FadeOut.duration(200)}
            >
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border
                }]}
                placeholder="Enter your topic..."
                placeholderTextColor={isDark ? '#777' : '#999'}
                value={customTopic}
                onChangeText={setCustomTopic}
              />
            </Animated.View>
          )}
          
          {/* Number of Questions */}
          <View style={styles.questionsContainer}>
            <Animated.Text style={[styles.sectionTitle, animatedText]}>
              Number of Questions
            </Animated.Text>
            
            <View style={styles.numberInputContainer}>
              <TouchableOpacity 
                style={[styles.numberButton, { backgroundColor: theme.card }]}
                onPress={() => {
                  const current = parseInt(numberOfQuestions, 10);
                  if (!isNaN(current) && current > 1) {
                    setNumberOfQuestions((current - 1).toString());
                  }
                }}
              >
                <Ionicons name="remove" size={24} color={theme.text} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.numberInput, {
                  backgroundColor: theme.card,
                  color: theme.text
                }]}
                value={numberOfQuestions}
                onChangeText={(text) => {
                  // Only allow numbers
                  if (/^\d*$/.test(text)) {
                    setNumberOfQuestions(text);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
              
              <TouchableOpacity 
                style={[styles.numberButton, { backgroundColor: theme.card }]}
                onPress={() => {
                  const current = parseInt(numberOfQuestions, 10);
                  if (!isNaN(current) && current < 20) {
                    setNumberOfQuestions((current + 1).toString());
                  }
                }}
              >
                <Ionicons name="add" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Start Quiz Button */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={handleStartQuiz}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.startButtonText}>Start Quiz</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 20,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTopicCard: {
    borderWidth: 2,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  customTopicContainer: {
    marginTop: 16,
  },
  input: {
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  questionsContainer: {
    marginTop: 16,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButton: {
    padding: 10,
    borderRadius: 10,
  },
  numberInput: {
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 10,
    width: 80,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 40,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 