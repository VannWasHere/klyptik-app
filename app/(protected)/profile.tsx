import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import ContrastHeader from '../components/ui/ContrastHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserProfile } from '../services/authService';
import { getTheme } from '../theme/theme';

// Utility function to process quiz data in different formats
const processQuizData = (quizData: any): { 
  questions: number;
  correctAnswers: number;
  score: number;
} => {
  // If it's the quiz format shown in the example
  if (quizData.quiz && Array.isArray(quizData.quiz)) {
    let totalQuestions = quizData.quiz.length;
    let correctAnswers = 0;
    
    quizData.quiz.forEach((question: any) => {
      if (!question.answer) return;
      
      // Handle different answer formats
      let userAnswer = question.answer;
      let correctAnswer = '';
      
      // If the answer is A, B, C, D format, convert to index
      if (typeof userAnswer === 'string' && userAnswer.length === 1) {
        // Convert A to 0, B to 1, etc.
        const answerIndex = userAnswer.charCodeAt(0) - 65;
        if (answerIndex >= 0 && answerIndex < question.options.length) {
          // The user selected an option by letter, and it's valid
          
          // Check if the answer is "All of the above" or similar
          const lowerCaseOption = question.options[answerIndex].toLowerCase();
          if (lowerCaseOption.includes('all of the above')) {
            correctAnswer = question.options[answerIndex];
          } else if (userAnswer === 'D' && question.options.length === 4) {
            // Assuming D is often "All of the above" in 4-option questions
            correctAnswer = question.options[3];
          }
        }
      }
      
      // If the answer matches explicitly or it's "all of the above" and was selected
      if (
        userAnswer === 'D' && question.explanation.toLowerCase().includes('all') ||
        correctAnswer && correctAnswer.toLowerCase().includes('all') ||
        userAnswer.toLowerCase() === 'all of the above' ||
        userAnswer.toLowerCase() === 'd' && question.explanation.toLowerCase().includes('all')
      ) {
        correctAnswers++;
      }
    });
    
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    return {
      questions: totalQuestions,
      correctAnswers: correctAnswers,
      score: Math.round(score)
    };
  }
  
  // Default empty response for unsupported formats
  return {
    questions: 0,
    correctAnswers: 0,
    score: 0
  };
};

// Helper function to determine user rank based on score
const getUserRank = (score: number): { label: string; color: string; background: string; description: string } => {
  if (score >= 90) {
    return { 
      label: 'Immortal', 
      color: '#FFD700', 
      background: 'linear-gradient(45deg, #8B0000, #C71585)',
      description: 'Score 90% or higher. You\'ve achieved legendary knowledge!'
    };
  } else if (score >= 80) {
    return { 
      label: 'Divine', 
      color: '#E5E4E2', 
      background: 'linear-gradient(45deg, #4B0082, #800080)',
      description: 'Score 80% or higher. Your wisdom is truly divine!'
    };
  } else if (score >= 70) {
    return { 
      label: 'Ancient', 
      color: '#FF8C00', 
      background: 'linear-gradient(45deg, #8B4513, #A0522D)',
      description: 'Score 70% or higher. Your knowledge is timeless!'
    };
  } else if (score >= 50) {
    return { 
      label: 'Legend', 
      color: '#7CFC00', 
      background: 'linear-gradient(45deg, #006400, #228B22)',
      description: 'Score 50% or higher. Your legendary status grows!'
    };
  } else if (score > 0) {
    return { 
      label: 'Crusader', 
      color: '#00BFFF', 
      background: 'linear-gradient(45deg, #00008B, #0000CD)',
      description: 'Score below 50%. Your quest for knowledge has begun!'
    };
  } else {
    return { 
      label: 'Newcomer', 
      color: '#FFFFFF', 
      background: 'linear-gradient(45deg, #2C3E50, #4CA1AF)',
      description: 'Welcome! Complete your first quiz to begin your journey.'
    };
  }
};

interface UserProfile {
  uid: string;
  display_name: string;
  email: string;
  username: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
  quizStats: {
    totalQuizzes: number;
    totalQuestions: number;
    totalCorrect: number;
    averageScore: number;
  };
  quizData?: any;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [processedData, setProcessedData] = useState<{
    questions: number;
    correctAnswers: number;
    score: number;
  } | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const userProfile = await getUserProfile(user.uid);
          
          // Check if the profile has raw quiz data that needs processing
          if (userProfile.quizData) {
            const processed = processQuizData(userProfile.quizData);
            setProcessedData(processed);
            
            // Update stats if needed based on processed data
            if (processed.questions > 0) {
              userProfile.quizStats = {
                ...userProfile.quizStats,
                totalQuestions: processed.questions,
                totalCorrect: processed.correctAnswers,
                averageScore: processed.score
              };
            }
          }
          
          // Initialize quizStats if they don't exist
          if (!userProfile.quizStats) {
            userProfile.quizStats = {
              totalQuizzes: 0,
              totalQuestions: 0,
              totalCorrect: 0,
              averageScore: 0
            };
          }
          
          setProfile(userProfile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ContrastHeader title="Profile" />
        
        {profile ? (
          <>
            <Animated.View 
              entering={FadeIn.duration(400)}
              style={[styles.profileCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>
                      {profile.display_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text 
                      style={[styles.displayName, { color: theme.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {profile.display_name}
                    </Text>
                    <Text 
                      style={[styles.username, { color: isDark ? '#aaa' : '#666' }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      @{profile.username}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.badgeContainer}>
                <View style={styles.rankContainer}>
                  {profile.quizStats.totalQuizzes > 0 ? (
                    <View style={[
                      styles.rankBadge, 
                      { 
                        backgroundColor: getUserRank(profile.quizStats.averageScore).background.includes('linear-gradient') ? 
                          '#' + getUserRank(profile.quizStats.averageScore).background.split('#')[1].split(',')[0] : 
                          getUserRank(profile.quizStats.averageScore).background 
                      }
                    ]}>
                      <Text style={[
                        styles.rankText, 
                        { color: getUserRank(profile.quizStats.averageScore).color }
                      ]}>
                        {getUserRank(profile.quizStats.averageScore).label}
                      </Text>
                    </View>
                  ) : (
                    <View style={[
                      styles.rankBadge, 
                      { 
                        backgroundColor: getUserRank(0).background.includes('linear-gradient') ? 
                          '#' + getUserRank(0).background.split('#')[1].split(',')[0] : 
                          getUserRank(0).background 
                      }
                    ]}>
                      <Text style={[
                        styles.rankText, 
                        { color: getUserRank(0).color }
                      ]}>
                        {getUserRank(0).label}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.rankInfoButton}
                    onPress={() => setShowRankInfo(true)}
                  >
                    <Ionicons name="help-circle" size={20} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color={theme.primary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>{profile.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                  <Text style={[styles.infoText, { color: theme.text }]}>
                    Joined {formatDate(profile.created_at)}
                  </Text>
                </View>
              </View>
            </Animated.View>
            
            <Animated.View 
              entering={FadeIn.duration(400).delay(100)}
              style={[styles.statsCard, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>Quiz Statistics</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <View style={[styles.statItem, styles.quizStatItem]}>
                    <View style={[styles.statIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                      <Ionicons name="document-text-outline" size={28} color="#4caf50" />
                    </View>
                    <Text style={[styles.statValue, { color: '#4caf50', fontSize: 24 }]}>{profile.quizStats.totalQuizzes}</Text>
                    <Text style={styles.quizStatLabel}>Quizzes</Text>
                  </View>
                  
                  <View style={[styles.statItem, styles.questionsStatItem]}>
                    <View style={[styles.statIconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
                      <Ionicons name="help-circle-outline" size={28} color="#2196f3" />
                    </View>
                    <Text style={[styles.statValue, { color: '#2196f3', fontSize: 24 }]}>{profile.quizStats.totalQuestions}</Text>
                    <Text style={styles.questionsStatLabel}>Questions</Text>
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={[styles.statItem, styles.correctStatItem]}>
                    <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                      <Ionicons name="checkmark-circle-outline" size={28} color="#ff9800" />
                    </View>
                    <Text style={[styles.statValue, { color: '#ff9800', fontSize: 24 }]}>{profile.quizStats.totalCorrect}</Text>
                    <Text style={styles.correctStatLabel}>Correct</Text>
                  </View>
                  
                  <View style={[styles.statItem, styles.averageStatItem]}>
                    <View style={[styles.statIconCircle, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
                      <Ionicons name="bar-chart-outline" size={28} color="#9c27b0" />
                    </View>
                    <Text style={[styles.statValue, { color: '#9c27b0', fontSize: 24 }]}>{Math.round(profile.quizStats.averageScore)}%</Text>
                    <Text style={styles.averageStatLabel}>Average Score</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
            
            <Animated.View
              entering={FadeIn.duration(400).delay(200)}
              style={[styles.actionsCard, { backgroundColor: theme.card }]}
            >
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => router.push('/(protected)/quiz-setup')}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                  <Ionicons name="add-circle-outline" size={24} color="#4caf50" />
                </View>
                <Text style={[styles.actionText, { color: theme.text }]}>Create New Quiz</Text>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#aaa' : '#666'} />
              </TouchableOpacity>
              
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => router.push('/(protected)/quiz-history')}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Ionicons name="time-outline" size={24} color="#2196f3" />
                </View>
                <Text style={[styles.actionText, { color: theme.text }]}>View Quiz History</Text>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#aaa' : '#666'} />
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.error || '#f44336'} />
            <Text style={[styles.errorText, { color: theme.text }]}>
              Failed to load profile
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => setIsLoading(true)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Rank Info Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRankInfo}
          onRequestClose={() => setShowRankInfo(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Ranking System</Text>
              
              <View style={styles.ranksList}>
                {[90, 80, 70, 50, 1, 0].map((threshold) => {
                  const rank = getUserRank(threshold);
                  const bgColor = rank.background.includes('linear-gradient') ? 
                    '#' + rank.background.split('#')[1].split(',')[0] : 
                    rank.background;
                    
                  return (
                    <View key={rank.label} style={styles.rankItem}>
                      <View style={[styles.rankItemBadge, { backgroundColor: bgColor }]}>
                        <Text style={[styles.rankItemText, { color: rank.color }]}>{rank.label}</Text>
                      </View>
                      <Text style={[styles.rankItemDescription, { color: theme.text }]}>
                        {rank.description}
                      </Text>
                    </View>
                  );
                })}
              </View>
              
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowRankInfo(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  profileCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  username: {
    fontSize: 16,
    marginTop: 2,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rankInfoButton: {
    padding: 6,
    marginLeft: 6,
  },
  infoContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  statsContainer: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    minHeight: 140,
    justifyContent: 'center',
  },
  quizStatItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: '#4caf50',
  },
  questionsStatItem: {
    backgroundColor: 'rgba(33, 150, 243, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    shadowColor: '#2196f3',
  },
  correctStatItem: {
    backgroundColor: 'rgba(255, 152, 0, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    shadowColor: '#ff9800',
  },
  averageStatItem: {
    backgroundColor: 'rgba(156, 39, 176, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
    shadowColor: '#9c27b0',
  },
  statIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  quizStatLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4caf50',
  },
  questionsStatLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2196f3',
  },
  correctStatLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff9800',
  },
  averageStatLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9c27b0',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ranksList: {
    marginBottom: 20,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  rankItemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  rankItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rankItemDescription: {
    fontSize: 14,
    flex: 1,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 