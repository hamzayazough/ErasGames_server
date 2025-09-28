import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useTheme, RetroBackground} from '../../../core/theme';
import {Text, Button, Card} from '../../../ui';
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
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 3000) return '#4CAF50'; // Green for excellent
    if (score >= 2000) return '#FF9800'; // Orange for good
    return '#F44336'; // Red for needs improvement
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 3000) return 'Outstanding Performance! 🏆';
    if (score >= 2000) return 'Great Job! 👏';
    if (score >= 1000) return 'Good Effort! 👍';
    return 'Keep Practicing! 💪';
  };

  return (
    <RetroBackground style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Quiz Complete! 🎉
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {getPerformanceMessage(finalScore)}
          </Text>
        </View>

        {/* Final Score Card */}
        <Card style={[styles.scoreCard, {borderColor: getScoreColor(finalScore)}]}>
          <View style={styles.scoreContent}>
            <Text style={[styles.scoreLabel, {color: theme.colors.textSecondary}]}>
              Final Score
            </Text>
            <Text style={[styles.finalScore, {color: getScoreColor(finalScore)}]}>
              {finalScore.toLocaleString()}
            </Text>
            <View style={styles.scoreBadge}>
              <Text style={[styles.scoreBadgeText, {color: theme.colors.background}]}>
                {finalScore >= 3000 ? 'EXCELLENT' : finalScore >= 2000 ? 'GREAT' : 'GOOD'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Performance Stats */}
        <Card style={styles.statsCard}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Performance Stats
          </Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                {formatTime(finishTimeSeconds)}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Finish Time
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                {correctAnswers}/{totalQuestions}
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Correct
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.primary}]}>
                {Math.round((correctAnswers / totalQuestions) * 100)}%
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Accuracy
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, {color: theme.colors.success}]}>
                {breakdown.minutesEarly}m
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                Early
              </Text>
            </View>
          </View>
        </Card>



        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Back to Daily Drop"
            onPress={() => navigation.navigate('DailyDrop')}
            style={[styles.primaryButton, {backgroundColor: theme.colors.primary}]}
            textStyle={{color: theme.colors.background}}
          />
          
          <Button
            title="View Leaderboard"
            onPress={() => {
              // TODO: Navigate to leaderboard when implemented
              navigation.navigate('DailyDrop');
            }}
            style={[styles.secondaryButton, {borderColor: theme.colors.primary}]}
            textStyle={{color: theme.colors.primary}}
          />
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
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scoreCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scoreContent: {
    padding: 32,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  actionButtons: {
    marginHorizontal: 24,
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  bottomPadding: {
    height: 40,
  },
});