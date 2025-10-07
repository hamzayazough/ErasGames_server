import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {Text} from '../../../ui';
import {Card} from '../../../ui/Card';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'QuizResults'>;

const {width: screenWidth} = Dimensions.get('window');

export default function QuizResultsScreen({navigation, route}: Props) {
  const theme = useTheme();
  
  const {quizResult} = route.params;
  const {finalScore, finishTimeSeconds, questions, ranking} = quizResult;
  
  const totalQuestions = questions?.length || 0;
  const correctAnswers = questions?.filter(q => q.isCorrect).length || 0;
  
  // Animation values
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [countingAnimation] = useState(new Animated.Value(0));
  const [displayScore, setDisplayScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timeLeft, setTimeLeft] = useState('23:45:12');
  
  // Ranking data
  const hasRankingData = ranking && ranking.rankingContext && ranking.rankingContext.length > 0;
  
  // Get actual leaderboard data from API response
  const leaderboardData = hasRankingData 
    ? ranking.rankingContext.map((player: any) => ({
        id: player.userId,
        username: player.handle || player.name || 'Anonymous',
        totalScore: player.totalPoints || 0,
        avatar: `https://i.pravatar.cc/150?u=${player.userId}`, // Use userId for consistent avatars
        isCurrentUser: player.isCurrentUser || false,
        rank: player.rank || 0,
        country: player.country || null
      }))
    : [];
  
  // Find current user from leaderboard data
  const currentUser = leaderboardData.find((player: any) => player.isCurrentUser) || null;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
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
        // Show leaderboard after score animation
        setTimeout(() => {
          setShowLeaderboard(true);
        }, 500);
      });

      // Update display score in real time
      const listener = countingAnimation.addListener(({ value }) => {
        setDisplayScore(Math.floor(value));
      });

      return () => countingAnimation.removeListener(listener);
    }, 500);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Calculate time until end of day (midnight)
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('00:00:00');
      }
    }, 1000);

    return () => clearInterval(timer);
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
      <ThemedBackground 
        theme={theme} 
        variant="quiz"
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar 
        barStyle={theme.dark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      
      {!showLeaderboard ? (
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
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.leaderboardTitle, { color: theme.colors.text }]}>
              Daily Leaderboard
            </Text>
          </View>
          
          {/* Player Score Section */}
          <View style={[styles.playerScoreSection, { backgroundColor: theme.colors.card }]}>
            <View style={styles.coinContainer}>
              <Image 
                source={require('../../../assets/images/coin.png')} 
                style={styles.coinIcon} 
              />
              <Text style={[styles.coinText, { color: theme.colors.primary }]}>
                +{accPoints || finalScore}
              </Text>
            </View>
            <Text style={[styles.earnedText, { color: theme.colors.textSecondary }]}>
              Earned this round
            </Text>
          </View>
          
          {/* Leaderboard List */}
          <Card style={[styles.leaderboardContainer, { backgroundColor: theme.colors.card }]}>
            {leaderboardData && leaderboardData.length > 0 ? (
              leaderboardData.slice(0, 10).map((player: any) => (
                <View 
                  key={player.id} 
                  style={[
                    styles.playerRow,
                    player.isCurrentUser && [styles.currentPlayerRow, { backgroundColor: theme.colors.primaryContainer }]
                  ]}
                >
                  <Text style={[
                    styles.playerRank, 
                    { color: theme.colors.textSecondary },
                    player.isCurrentUser && { color: theme.colors.primary }
                  ]}>
                    #{player.rank}
                  </Text>
                  <Image 
                    source={{ uri: player.avatar }} 
                    style={styles.playerAvatar} 
                  />
                  <View style={styles.playerInfo}>
                    <Text style={[
                      styles.playerName,
                      { color: theme.colors.text },
                      player.isCurrentUser && [styles.currentPlayerName, { color: theme.colors.primary }]
                    ]}>
                      {player.isCurrentUser ? 'You' : player.username}
                    </Text>
                    {player.country && (
                      <Text style={[styles.playerCountry, { color: theme.colors.textSecondary }]}>
                        {player.country}
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.playerScore,
                    { color: theme.colors.text },
                    player.isCurrentUser && [styles.currentPlayerScore, { color: theme.colors.primary }]
                  ]}>
                    {player.totalScore.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                  Leaderboard data not available
                </Text>
              </View>
            )}
          </Card>
          
          {/* Countdown Timer */}
          <View style={[styles.timerContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.timerText, { color: theme.colors.textSecondary }]}>
              Ends in {timeLeft}
            </Text>
          </View>
          
          {/* Continue Button */}
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
      )}
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
  // Leaderboard styles
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  playerScoreSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coinIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  coinText: {
    fontSize: 24,
    fontWeight: '700',
  },
  earnedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  leaderboardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentPlayerRow: {
    borderWidth: 2,
    borderRadius: 12,
  },
  playerRank: {
    fontSize: 16,
    fontWeight: '600',
    width: 40,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerCountry: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  currentPlayerName: {
    fontWeight: '700',
  },
  playerScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlayerScore: {
    fontWeight: '700',
  },
  timerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
  },
});