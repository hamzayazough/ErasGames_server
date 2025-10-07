import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {useTheme} from '../../../core/theme';
import {Text} from '../../../ui';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'QuizResults'>;

export default function QuizResultsScreen({navigation, route}: Props) {
  const theme = useTheme();
  
  const {quizResult} = route.params;
  const {finalScore, questions, ranking} = quizResult;
  
  const totalQuestions = questions?.length || 0;
  const correctAnswers = questions?.filter(q => q.isCorrect).length || 0;
  
  // Animation values
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [countingAnimation] = useState(new Animated.Value(0));
  const [displayScore, setDisplayScore] = useState(0);
  
  // Ranking data
  const hasRankingData = ranking && ranking.rankingContext && ranking.rankingContext.length > 0;
  
  useEffect(() => {
    // Start animations
    setTimeout(() => {
      // Scale animation for the score container
      Animated.timing(scoreAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Counting animation from 0 to final score
      Animated.timing(countingAnimation, {
        toValue: finalScore,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      // Update display score in real time
      const listener = countingAnimation.addListener(({ value }) => {
        setDisplayScore(Math.floor(value));
      });

      return () => countingAnimation.removeListener(listener);
    }, 500);
  }, []);

  const getScoreMessage = () => {
    if (finalScore === 0) return "Better luck next time! 🎯";
    if (finalScore < 50) return "Keep practicing! 💪";
    if (finalScore < 100) return "Good job! 🌟";
    return "Excellent work! 🏆";
  };

  const getScoreEmoji = () => {
    if (finalScore === 0) return "😅";
    if (finalScore < 50) return "🎲";
    if (finalScore < 100) return "⭐";
    return "🏆";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.dark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.gameCompleteText, { color: theme.colors.textSecondary }]}>
            Quiz Complete
          </Text>
        </View>

        {/* Main Score Display */}
        <Animated.View style={[
          styles.scoreContainer, 
          { backgroundColor: theme.colors.card },
          {
            transform: [{
              scale: scoreAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }],
            opacity: scoreAnimation,
          }
        ]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreEmoji]}>{getScoreEmoji()}</Text>
            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
              Your Score
            </Text>
          </View>
          
          <Text style={[styles.finalScore, { color: theme.colors.primary }]}>
            {displayScore.toLocaleString()}
          </Text>
          
          <Text style={[styles.scoreMessage, { color: theme.colors.textSecondary }]}>
            {getScoreMessage()}
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Text style={[styles.quickStatsText, { color: theme.colors.text }]}>
              {correctAnswers} of {totalQuestions} correct
            </Text>
          </View>
        </Animated.View>

        {/* Ranking (if available) */}
        {hasRankingData && (
          <View style={[styles.rankingContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.rankingTitle, { color: theme.colors.text }]}>
              {ranking.seasonInfo.displayName}
            </Text>
            
            <View style={[styles.rankBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.rankText, { color: theme.colors.onPrimary || '#FFFFFF' }]}>
                #{ranking.currentRank}
              </Text>
            </View>
            
            <Text style={[styles.totalPointsText, { color: theme.colors.textSecondary }]}>
              Total Season Points: {ranking.totalPoints.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'DailyDrop' }],
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary || '#FFFFFF' }]}>
              🏠 Back Home
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
    paddingBottom: 30,
    alignItems: 'center',
  },
  gameCompleteText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 64,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -2,
  },
  scoreMessage: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickStats: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  quickStatsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  rankingContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  rankBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
  },
  rankText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  totalPointsText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  homeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});