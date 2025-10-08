import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../../core/context/ThemeContext';
import { ThemedBackground } from '../../../ui/components/ThemedBackground';
import { Card } from '../../../ui/components/Card';

const { width: screenWidth } = Dimensions.get('window');

interface LeaderboardProps {
  navigation: any;
  route: {
    params: {
      quizResults: {
        score: number;
        accPoints: number;
        previousScore: number;
        newTotalScore: number;
        ranking: {
          currentRank: number;
          previousRank?: number;
          totalPoints: number;
          rankingContext: Array<{
            userId: string;
            handle: string;
            name?: string;
            country?: string;
            totalPoints: number;
            rank: number;
            isCurrentUser: boolean;
          }>;
          seasonInfo: {
            id: string;
            name: string;
            displayName: string;
          };
        };
      };
    };
  };
}

export function LeaderboardScreen({ navigation, route }: LeaderboardProps) {
  const { theme } = useTheme();
  const { quizResults } = route.params;
  const { score, accPoints, previousScore, newTotalScore, ranking } = quizResults;

  const [animatingScores, setAnimatingScores] = useState(false);
  const [currentUserAnimatedScore, setCurrentUserAnimatedScore] = useState(previousScore);
  const [rankImprovement, setRankImprovement] = useState(0);

  const scoreAnimation = useRef(new Animated.Value(0)).current;

  // Debug logging
  console.log('Leaderboard Screen - Full quizResults:', JSON.stringify(quizResults, null, 2));
  console.log('Leaderboard Screen - Ranking data:', ranking);
  console.log('Leaderboard Screen - RankingContext:', ranking?.rankingContext);
  console.log('Leaderboard Screen - Condition check:', {
    hasRanking: !!ranking,
    hasRankingContext: !!ranking?.rankingContext,
    rankingContextLength: ranking?.rankingContext?.length,
    willShowError: !ranking || !ranking.rankingContext
  });

  // Check if ranking data is available - be more lenient about single-user scenarios
  if (!ranking || !ranking.rankingContext) {
    console.log('Leaderboard Screen - No ranking object or context');
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedBackground 
          theme={theme} 
          variant="quiz"
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Leaderboard data not available
          </Text>
          <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
            Debug: ranking={ranking ? 'exists' : 'null'}, 
            context={ranking?.rankingContext ? ranking.rankingContext.length : 'none'}
          </Text>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary || '#FFFFFF' }]}>
              🏠 Back Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Find current user
  const currentUser = ranking.rankingContext?.find(player => player.isCurrentUser);

  // Get leaderboard with top 3 + contextual players (no duplicates)
  const getSmartLeaderboard = () => {
    if (!ranking.rankingContext || ranking.rankingContext.length === 0) {
      console.log('No ranking context available');
      return [];
    }
    
    const allPlayers = ranking.rankingContext;
    const top3 = allPlayers.filter(p => p.rank <= 3);
    
    if (!currentUser || currentUser.rank <= 3) {
      return top3.slice(0, 10); // If user is in top 3, just show top players
    }

    // User is not in top 3, get contextual players around them
    const userRank = currentUser.rank;
    const contextualPlayers = allPlayers.filter(p => {
      // Get 5 above and 5 below user, excluding top 3 to avoid duplicates
      return p.rank > 3 && p.rank >= (userRank - 5) && p.rank <= (userRank + 5);
    });

    return [...top3, ...contextualPlayers];
  };

  const leaderboardData = getSmartLeaderboard();
  
  console.log('Leaderboard Screen - Final leaderboardData:', leaderboardData);
  console.log('Leaderboard Screen - Top 3 players:', leaderboardData.filter(p => p.rank <= 3));
  console.log('Leaderboard Screen - Current user:', currentUser);

  useEffect(() => {
    // Start entrance animation
    Animated.timing(scoreAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start(() => {
      // Start score animation after entrance
      if (accPoints > 0) {
        setTimeout(() => {
          animateScoreIncrease();
        }, 500);
      }
    });
  }, []);



  // Animate score increase
  const animateScoreIncrease = () => {
    if (!currentUser || !accPoints) return;
    
    setAnimatingScores(true);
    const startScore = previousScore;
    const endScore = newTotalScore;
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 fps
    const increment = (endScore - startScore) / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newScore = startScore + (increment * currentStep);
      setCurrentUserAnimatedScore(Math.floor(newScore));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setCurrentUserAnimatedScore(endScore);
        setAnimatingScores(false);
        checkRankImprovement();
      }
    }, duration / steps);
  };

  // Check if user moved up in ranking
  const checkRankImprovement = () => {
    if (!currentUser || !ranking.previousRank) return;
    
    const rankImprovement = ranking.previousRank - ranking.currentRank;
    if (rankImprovement > 0) {
      setRankImprovement(rankImprovement);
      setTimeout(() => setRankImprovement(0), 3000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ThemedBackground 
        theme={theme} 
        variant="quiz"
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.leaderboardTitle, { color: theme.colors.text }]}>
            {ranking.seasonInfo.displayName}
          </Text>
          {currentUser && (
            <View style={styles.userRankContainer}>
              <Text style={[styles.userRankInfo, { color: theme.colors.textSecondary }]}>
                Your Rank: #{ranking.currentRank} • {ranking.totalPoints.toLocaleString()} pts
              </Text>
              {rankImprovement > 0 && (
                <Text style={[styles.rankImprovementText, { color: theme.colors.success || '#4CAF50' }]}>
                  🎉 You moved up {rankImprovement} position{rankImprovement > 1 ? 's' : ''}!
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Player Score Section */}
        <Animated.View style={[
          styles.playerScoreSection, 
          { backgroundColor: theme.colors.card },
          { opacity: scoreAnimation }
        ]}>
          <View style={styles.coinContainer}>
            <Text style={styles.coinIcon}>🪙</Text> 
            />
            <Text style={[styles.coinText, { color: theme.colors.primary }]}>
              +{accPoints}
            </Text>
          </View>
          <Text style={[styles.earnedText, { color: theme.colors.textSecondary }]}>
            Earned this round
          </Text>
        </Animated.View>
        
        {/* Top 3 Section */}
        {leaderboardData.filter(p => p.rank <= 3).length > 0 && (
          <View style={styles.top3Section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              🏆 Top 3
            </Text>
            <Card style={[styles.leaderboardContainer, { backgroundColor: theme.colors.card }]}>
              {leaderboardData.filter(p => p.rank <= 3).map((player) => (
                <View 
                  key={player.userId} 
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
                    source={{ uri: `https://i.pravatar.cc/150?u=${player.userId}` }} 
                    style={styles.playerAvatar} 
                  />
                  <View style={styles.playerInfo}>
                    <Text style={[
                      styles.playerName,
                      { color: theme.colors.text },
                      player.isCurrentUser && [styles.currentPlayerName, { color: theme.colors.primary }]
                    ]}>
                      {player.isCurrentUser ? 'You' : (player.handle || player.name)}
                    </Text>
                    {player.country && (
                      <Text style={[styles.playerCountry, { color: theme.colors.textSecondary }]}>
                        {player.country}
                      </Text>
                    )}
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={[
                      styles.playerScore,
                      { color: theme.colors.text },
                      player.isCurrentUser && [styles.currentPlayerScore, { color: theme.colors.primary }]
                    ]}>
                      {player.isCurrentUser && animatingScores 
                        ? currentUserAnimatedScore.toLocaleString()
                        : player.totalPoints.toLocaleString()
                      }
                    </Text>
                    {player.isCurrentUser && accPoints > 0 && (
                      <Text style={[styles.pointsGained, { color: theme.colors.success || '#4CAF50' }]}>
                        +{accPoints}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}
        
        {/* Around You Section */}
        {currentUser && currentUser.rank > 3 && (
          <View style={styles.aroundYouSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📍 Around You
            </Text>
            <Card style={[styles.leaderboardContainer, { backgroundColor: theme.colors.card }]}>
              {leaderboardData.filter(p => p.rank > 3).map((player) => (
                <View 
                  key={player.userId} 
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
                    source={{ uri: `https://i.pravatar.cc/150?u=${player.userId}` }} 
                    style={styles.playerAvatar} 
                  />
                  <View style={styles.playerInfo}>
                    <Text style={[
                      styles.playerName,
                      { color: theme.colors.text },
                      player.isCurrentUser && [styles.currentPlayerName, { color: theme.colors.primary }]
                    ]}>
                      {player.isCurrentUser ? 'You' : (player.handle || player.name)}
                    </Text>
                    {player.country && (
                      <Text style={[styles.playerCountry, { color: theme.colors.textSecondary }]}>
                        {player.country}
                      </Text>
                    )}
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={[
                      styles.playerScore,
                      { color: theme.colors.text },
                      player.isCurrentUser && [styles.currentPlayerScore, { color: theme.colors.primary }]
                    ]}>
                      {player.isCurrentUser && animatingScores 
                        ? currentUserAnimatedScore.toLocaleString()
                        : player.totalPoints.toLocaleString()
                      }
                    </Text>
                    {player.isCurrentUser && accPoints > 0 && (
                      <Text style={[styles.pointsGained, { color: theme.colors.success || '#4CAF50' }]}>
                        +{accPoints}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}
        
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
  leaderboardTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  userRankContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  userRankInfo: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  rankImprovementText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
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
    fontSize: 32,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  top3Section: {
    marginBottom: 20,
  },
  aroundYouSection: {
    marginBottom: 20,
  },
  leaderboardContainer: {
    marginHorizontal: 20,
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
  currentPlayerName: {
    fontWeight: '700',
  },
  playerCountry: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  playerScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlayerScore: {
    fontWeight: '700',
  },
  pointsGained: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 20,
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