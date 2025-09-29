import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useTheme, RetroBackground} from '../../../core/theme';
import {Text} from '../../../ui';
import type {RootStackScreenProps} from '../../../navigation/types';
import type {QuizSubmission} from '../../../core/services/quiz-attempt.service';

type Props = RootStackScreenProps<'QuizResults'>;

interface ScoreBreakdown {
  base: number;
  accuracyBonus: number;
  speedBonus: number;
  earlyBonus: number;
}



export default function QuizResultsScreen({navigation, route}: Props) {
  const theme = useTheme();
  const {width} = Dimensions.get('window');
  
  const {quizResult} = route.params;
  const {finalScore, scoreBreakdown, finishTimeSeconds, accuracyPoints, questions} = quizResult;
  
  const breakdown = scoreBreakdown as ScoreBreakdown;
  const totalQuestions = questions?.length || 0;
  const correctAnswers = questions?.filter(q => q.isCorrect).length || 0;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Animation values
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [showDetails, setShowDetails] = useState(false);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRank = (score: number) => {
    if (score >= 4000) return { title: 'LEGENDARY', emoji: '👑', color: '#FFD700' };
    if (score >= 3000) return { title: 'EXPERT', emoji: '🏆', color: '#4CAF50' };
    if (score >= 2000) return { title: 'SKILLED', emoji: '⭐', color: theme.colors.primary };
    if (score >= 1000) return { title: 'LEARNING', emoji: '📈', color: '#FF9800' };
    return { title: 'ROOKIE', emoji: '🌱', color: '#9E9E9E' };
  };





    
    if (finalScore >= 3000) {
      achievements.push({
        id: 'highscore',
        title: 'High Achiever',
        icon: '�',
        description: 'Scored over 3000 points',
        unlocked: true
      });
    }
  useEffect(() => {
    // Animate score reveal
    Animated.timing(scoreAnimation, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => setShowDetails(true), 300);
    });
  }, []);

  const rank = getRank(finalScore);

  return (
    <RetroBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.gameCompleteText, { color: theme.colors.accent1 }]}>
            QUIZ COMPLETE
          </Text>
          <Text style={[styles.rankTitle, { color: rank.color }]}>
            {rank.emoji} {rank.title}
          </Text>
        </View>

        {/* Main Score Display */}
        <View style={[styles.scoreContainer, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreLabel, { color: theme.colors.accent4 }]}>
              FINAL SCORE
            </Text>
          </View>
          
          <Animated.View style={[styles.scoreDisplay, {
            transform: [{
              scale: scoreAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.1, 1],
              })
            }]
          }]}>
            <Text style={[styles.finalScore, { color: theme.colors.primary }]}>
              {Math.floor(finalScore * scoreAnimation._value).toLocaleString()}
            </Text>
          </Animated.View>
          
          <View style={[styles.rankBadge, { backgroundColor: rank.color }]}>
            <Text style={[styles.rankBadgeText, { color: '#FFFFFF' }]}>
              {rank.title}
            </Text>
          </View>
        </View>

        {/* Performance Breakdown */}
        {showDetails && (
          <View style={[styles.statsContainer, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent1 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.accent4 }]}>
              PERFORMANCE BREAKDOWN
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.statIconText}>⏱️</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.accent4 }]}>
                  {formatTime(finishTimeSeconds)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent4, opacity: 0.7 }]}>
                  TIME
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.success }]}>
                  <Text style={styles.statIconText}>✓</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.accent4 }]}>
                  {correctAnswers}/{totalQuestions}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent4, opacity: 0.7 }]}>
                  CORRECT
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.warning }]}>
                  <Text style={styles.statIconText}>🎯</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.accent4 }]}>
                  {accuracy}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent4, opacity: 0.7 }]}>
                  ACCURACY
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.info }]}>
                  <Text style={styles.statIconText}>⚡</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.accent4 }]}>
                  {Math.max(0, 300 - finishTimeSeconds)}s
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.accent4, opacity: 0.7 }]}>
                  BONUS
                </Text>
              </View>
            </View>
          </View>
        )}



        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('DailyDrop')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.colors.accent1 }]}>
              🏠 BACK TO DAILY DROP
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.colors.accent1, borderColor: theme.colors.accent4 }]}
            onPress={() => navigation.navigate('DailyDrop')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.colors.accent4 }]}>
              🏆 VIEW LEADERBOARD
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </RetroBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  gameCompleteText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.8,
  },
  rankTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  scoreContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreHeader: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  rankBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  actionButtons: {
    marginHorizontal: 20,
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bottomPadding: {
    height: 30,
  },
});