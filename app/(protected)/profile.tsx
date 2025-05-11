import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserProfile } from '../services/authService';
import { getTheme } from '../theme/theme';

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
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const userProfile = await getUserProfile(user.uid);
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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              onPress={toggleTheme}
            >
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {profile ? (
          <>
            <Animated.View 
              entering={FadeIn.duration(400)}
              style={[styles.profileCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>
                    {profile.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.displayName, { color: theme.text }]}>
                {profile.display_name}
              </Text>
              <Text style={[styles.username, { color: isDark ? '#aaa' : '#666' }]}>
                @{profile.username}
              </Text>
              
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
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                    <Ionicons name="document-text-outline" size={24} color="#4caf50" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>{profile.quizStats.totalQuizzes}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Quizzes</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                    <Ionicons name="help-circle-outline" size={24} color="#2196f3" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>{profile.quizStats.totalQuestions}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Questions</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#ff9800" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>{profile.quizStats.totalCorrect}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Correct</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIconCircle, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                    <Ionicons name="bar-chart-outline" size={24} color="#9c27b0" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>{Math.round(profile.quizStats.averageScore)}%</Text>
                  <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Average</Text>
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
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    marginTop: 4,
  },
  infoContainer: {
    width: '100%',
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
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
}); 