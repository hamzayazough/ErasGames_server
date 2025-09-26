import React from 'react';
import {StyleSheet, ScrollView, StatusBar, Share, Alert} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'Results'>;

interface ScoreBreakdown {
  accuracy: {
    correct: number;
    total: number;
    points: number;
  };
  speed: {
    timeUsed: number;
    timeLimit: number;
    points: number;
  };
  earlyBonus: {
    startedEarly: number; // seconds early
    points: number;
  };
  total: number;
  rank: {
    current: number;
    previous: number;
    change: number;
  };
}

const mockResults: ScoreBreakdown = {
  accuracy: {
    correct: 5,
    total: 6,
    points: 83
  },
  speed: {
    timeUsed: 45, // 0:45
    timeLimit: 60, // 1:00
    points: 24
  },
  earlyBonus: {
    startedEarly: 180, // 3 minutes early
    points: 25
  },
  total: 132,
  rank: {
    current: 47,
    previous: 52,
    change: 5 // moved up 5 spots
  }
};

export default function ResultsScreen({navigation}: Props) {
  const theme = useTheme();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    try {
      const shareText = `🎵 Just crushed today's Eras Quiz! 
      
✨ Score: ${mockResults.total}/200
🎯 Accuracy: ${mockResults.accuracy.correct}/${mockResults.accuracy.total}
⚡ Speed Bonus: ${mockResults.speed.points} pts
🌟 Early Bird: ${mockResults.earlyBonus.points} pts
📈 Rank: #${mockResults.rank.current} (↗️${mockResults.rank.change})

Think you can beat me? 🏆 #ErasQuiz #SwiftieChallenge`;

      await Share.share({
        message: shareText,
      });
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share your results right now.');
    }
  };

  const goHome = () => {
    navigation.navigate('DailyDrop');
  };

  const getRankChangeIcon = () => {
    if (mockResults.rank.change > 0) return '📈';
    if (mockResults.rank.change < 0) return '📉';
    return '➡️';
  };

  const getRankChangeColor = () => {
    if (mockResults.rank.change > 0) return theme.colors.success;
    if (mockResults.rank.change < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading1" align="center" style={[styles.title, {color: theme.colors.primary}]}>
            🏆 Quiz Complete!
          </Text>
          <Text variant="body" align="center" style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Great job, Swiftie! Here's how you did:
          </Text>
        </View>

        {/* Total Score Card */}
        <Card style={[styles.scoreCard, {backgroundColor: theme.colors.card, borderColor: theme.colors.primary}]}>
          <View style={styles.scoreContent}>
            <Text variant="caption" align="center" style={[styles.scoreLabel, {color: theme.colors.textSecondary}]}>
              YOUR FINAL SCORE
            </Text>
            <Text variant="heading1" align="center" style={[styles.totalScore, {color: theme.colors.primary}]}>
              {mockResults.total}
            </Text>
            <Text variant="caption" align="center" style={[styles.scoreOutOf, {color: theme.colors.textSecondary}]}>
              out of 200 points
            </Text>
            
            {/* Rank display */}
            <View style={[styles.rankContainer, {backgroundColor: theme.colors.surface}]}>
              <Text variant="body" style={[styles.rankText, {color: theme.colors.text}]}>
                Global Rank: <Text style={[styles.rankNumber, {color: theme.colors.primary}]}>#{mockResults.rank.current}</Text>
              </Text>
              <View style={styles.rankChange}>
                <Text style={[styles.rankChangeIcon, {color: getRankChangeColor()}]}>
                  {getRankChangeIcon()}
                </Text>
                <Text style={[styles.rankChangeText, {color: getRankChangeColor()}]}>
                  {mockResults.rank.change > 0 ? '+' : ''}{mockResults.rank.change}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Score Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text variant="heading3" style={[styles.breakdownTitle, {color: theme.colors.text}]}>
            📊 Score Breakdown
          </Text>
          
          {/* Accuracy */}
          <Card style={[styles.breakdownCard, {backgroundColor: theme.colors.card}]}>
            <View style={styles.breakdownContent}>
              <View style={styles.breakdownHeader}>
                <Text style={[styles.breakdownEmoji, {color: theme.colors.success}]}>🎯</Text>
                <View style={styles.breakdownTextContainer}>
                  <Text variant="body" style={[styles.breakdownLabel, {color: theme.colors.text}]}>
                    Accuracy Bonus
                  </Text>
                  <Text variant="caption" style={[styles.breakdownSubtext, {color: theme.colors.textSecondary}]}>
                    {mockResults.accuracy.correct} correct out of {mockResults.accuracy.total}
                  </Text>
                </View>
                <Text variant="heading3" style={[styles.breakdownPoints, {color: theme.colors.success}]}>
                  +{mockResults.accuracy.points}
                </Text>
              </View>
              
              {/* Progress bar */}
              <View style={[styles.progressBar, {backgroundColor: theme.colors.surface}]}>
                <View 
                  style={[
                    styles.progressFill, 
                    {
                      backgroundColor: theme.colors.success,
                      width: `${(mockResults.accuracy.correct / mockResults.accuracy.total) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </Card>
          
          {/* Speed */}
          <Card style={[styles.breakdownCard, {backgroundColor: theme.colors.card}]}>
            <View style={styles.breakdownContent}>
              <View style={styles.breakdownHeader}>
                <Text style={[styles.breakdownEmoji, {color: theme.colors.warning}]}>⚡</Text>
                <View style={styles.breakdownTextContainer}>
                  <Text variant="body" style={[styles.breakdownLabel, {color: theme.colors.text}]}>
                    Speed Bonus
                  </Text>
                  <Text variant="caption" style={[styles.breakdownSubtext, {color: theme.colors.textSecondary}]}>
                    Finished in {formatTime(mockResults.speed.timeUsed)} / {formatTime(mockResults.speed.timeLimit)}
                  </Text>
                </View>
                <Text variant="heading3" style={[styles.breakdownPoints, {color: theme.colors.warning}]}>
                  +{mockResults.speed.points}
                </Text>
              </View>
              
              {/* Progress bar */}
              <View style={[styles.progressBar, {backgroundColor: theme.colors.surface}]}>
                <View 
                  style={[
                    styles.progressFill, 
                    {
                      backgroundColor: theme.colors.warning,
                      width: `${((mockResults.speed.timeLimit - mockResults.speed.timeUsed) / mockResults.speed.timeLimit) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </Card>
          
          {/* Early Bonus */}
          <Card style={[styles.breakdownCard, {backgroundColor: theme.colors.card}]}>
            <View style={styles.breakdownContent}>
              <View style={styles.breakdownHeader}>
                <Text style={[styles.breakdownEmoji, {color: theme.colors.lover}]}>🌟</Text>
                <View style={styles.breakdownTextContainer}>
                  <Text variant="body" style={[styles.breakdownLabel, {color: theme.colors.text}]}>
                    Early Bird Bonus
                  </Text>
                  <Text variant="caption" style={[styles.breakdownSubtext, {color: theme.colors.textSecondary}]}>
                    Started {Math.floor(mockResults.earlyBonus.startedEarly / 60)} minutes early
                  </Text>
                </View>
                <Text variant="heading3" style={[styles.breakdownPoints, {color: theme.colors.lover}]}>
                  +{mockResults.earlyBonus.points}
                </Text>
              </View>
              
              {/* Progress bar */}
              <View style={[styles.progressBar, {backgroundColor: theme.colors.surface}]}>
                <View 
                  style={[
                    styles.progressFill, 
                    {
                      backgroundColor: theme.colors.lover,
                      width: `${(mockResults.earlyBonus.startedEarly / 3600) * 100}%` // max 1 hour
                    }
                  ]} 
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Achievement */}
        <Card style={[styles.achievementCard, {backgroundColor: theme.colors.accent1}]}>
          <View style={styles.achievementContent}>
            <Text variant="heading3" align="center" style={[styles.achievementText, {color: theme.colors.text}]}>
              🎉 Achievement Unlocked!
            </Text>
            <Text variant="body" align="center" style={[styles.achievementDescription, {color: theme.colors.text}]}>
              "Speed of Sound" - Finished in under 8 minutes!
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="📱 Share Results"
            onPress={handleShare}
            style={[styles.shareButton, {backgroundColor: theme.colors.primary}]}
          />
          
          <Button
            title="🏠 Back to Home"
            onPress={goHome}
            variant="outline"
            style={styles.homeButton}
          />
        </View>

        {/* Tomorrow's Preview */}
        <Card style={[styles.previewCard, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.previewContent}>
            <Text variant="heading3" align="center" style={[styles.previewTitle, {color: theme.colors.text}]}>
              🌅 Tomorrow's Preview
            </Text>
            <Text variant="body" align="center" style={[styles.previewText, {color: theme.colors.textSecondary}]}>
              Get ready for <Text style={[styles.previewEra, {color: theme.colors.accent2}]}>Tomorrow's Era</Text> questions!
            </Text>
            <Text variant="caption" align="center" style={[styles.previewNote, {color: theme.colors.textSecondary}]}>
              Drop time: 6:00 PM - 10:00 PM local time
            </Text>
          </View>
        </Card>

        {/* Bottom padding */}
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
    paddingBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  scoreCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderRadius: 20,
  },
  scoreContent: {
    padding: 32,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  totalScore: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreOutOf: {
    fontSize: 14,
    marginBottom: 20,
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '500',
  },
  rankNumber: {
    fontWeight: 'bold',
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankChangeIcon: {
    fontSize: 16,
  },
  rankChangeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  breakdownContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  breakdownTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  breakdownCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  breakdownContent: {
    padding: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  breakdownTextContainer: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  breakdownSubtext: {
    fontSize: 12,
  },
  breakdownPoints: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  achievementContent: {
    padding: 20,
  },
  achievementText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 14,
  },
  actionButtons: {
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  shareButton: {
    paddingVertical: 16,
  },
  homeButton: {
    marginBottom: 0,
  },
  previewCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  previewContent: {
    padding: 20,
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    marginBottom: 4,
  },
  previewEra: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  previewNote: {
    fontSize: 12,
  },
  bottomPadding: {
    height: 40,
  },
});