import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {Text} from '../../../ui';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'QuizResults'>;

const {width: screenWidth} = Dimensions.get('window');

export default function QuizResultsScreen({navigation, route}: Props) {
  const theme = useTheme();
  
  const {quizResult} = route.params;
  const {finalScore, finishTimeSeconds, questions, ranking, accPoints, previousScore, newTotalScore} = quizResult;
  
  const totalQuestions = questions?.length || 0;
  const correctAnswers = questions?.filter(q => q.isCorrect).length || 0;
  
  // Animation values
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [countingAnimation] = useState(new Animated.Value(0));
  const [displayScore, setDisplayScore] = useState(0);
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
      }).start(() => {
        // After showing the result for 3 seconds, automatically navigate to leaderboard
        setTimeout(() => {
          console.log('🏆 Auto-navigating to leaderboard with quiz results...');
          navigation.navigate('Leaderboard', {
            quizResults: {
              score: finalScore,
              accPoints: accPoints || 0,
              previousScore: previousScore || 0,
              newTotalScore: newTotalScore || finalScore,
              ranking: ranking,
            },
          });
        }, 3000); // Show result for 3 seconds before auto-navigation
      });

      // Update display score in real time
      const listener = countingAnimation.addListener(({ value }) => {
        setDisplayScore(Math.floor(value));
      });

      return () => countingAnimation.removeListener(listener);
    }, 500);
  }, [finalScore, accPoints, previousScore, newTotalScore, ranking, navigation]);

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
      <ThemedBackground 
        theme={theme} 
        variant="quiz"
        style={StyleSheet.absoluteFillObject}
      />
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

        {/* Loading message for leaderboard */}
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Preparing leaderboard...
          </Text>
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
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  finalScore: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scoreMessage: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  quickStats: {
    alignItems: 'center',
  },
  quickStatsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
