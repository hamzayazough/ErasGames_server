import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, Card} from '../../../ui';
import {useTheme} from '../../../core/theme';
import {MySeasonStats} from '../../../core/api/seasons';

interface MyStatsCardProps {
  stats: MySeasonStats;
}

export function MyStatsCard({stats}: MyStatsCardProps) {
  const theme = useTheme();

  if (!stats.hasStats || !stats.stats) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text variant="h3" weight="medium">
            📊 My Stats
          </Text>
        </View>
        
        <View style={styles.noStatsContainer}>
          <Text variant="body" color="secondary" center>
            {stats.message}
          </Text>
          
          {stats.globalStats && (
            <View style={styles.globalStats}>
              <Text variant="caption" color="muted" center style={styles.globalTitle}>
                All-Time Stats
              </Text>
              <View style={styles.globalStatsRow}>
                <View style={styles.globalStatItem}>
                  <Text variant="h3" weight="bold" color="primary">
                    {stats.globalStats.totalQuizzesEver}
                  </Text>
                  <Text variant="caption" color="muted">
                    Total Quizzes
                  </Text>
                </View>
                <View style={styles.globalStatItem}>
                  <Text variant="h3" weight="bold" color="primary">
                    {stats.globalStats.totalPointsEver.toLocaleString()}
                  </Text>
                  <Text variant="caption" color="muted">
                    Total Points
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Card>
    );
  }

  const {season, participation} = stats.stats;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h3" weight="medium">
          📊 My Season Stats
        </Text>
        {participation.currentRank && (
          <View style={[styles.rankBadge, {backgroundColor: theme.colors.primary}]}>
            <Text variant="caption" color="textOnPrimary" weight="bold">
              #{participation.currentRank}
            </Text>
          </View>
        )}
      </View>

      <Text variant="caption" color="muted" style={styles.seasonName}>
        {season.displayName}
      </Text>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text variant="h2" weight="bold" color="primary">
            {participation.totalPoints.toLocaleString()}
          </Text>
          <Text variant="caption" color="muted">
            Points
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text variant="h2" weight="bold" color="primary">
            {participation.totalQuizzesCompleted}
          </Text>
          <Text variant="caption" color="muted">
            Quizzes
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text variant="h2" weight="bold" color="primary">
            {participation.currentStreak}
          </Text>
          <Text variant="caption" color="muted">
            Streak
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text variant="h2" weight="bold" color="primary">
            {participation.perfectScores}
          </Text>
          <Text variant="caption" color="muted">
            Perfect
          </Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatRow}>
          <Text variant="caption" color="muted">
            Longest Streak
          </Text>
          <Text variant="body" weight="medium">
            {participation.longestStreak}
          </Text>
        </View>
        
        <View style={styles.additionalStatRow}>
          <Text variant="caption" color="muted">
            Avg Points/Quiz
          </Text>
          <Text variant="body" weight="medium">
            {participation.averagePointsPerQuiz.toFixed(1)}
          </Text>
        </View>
        
        <View style={styles.additionalStatRow}>
          <Text variant="caption" color="muted">
            Perfect Rate
          </Text>
          <Text variant="body" weight="medium">
            {(participation.perfectScoreRate * 100).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Global Stats */}
      {stats.globalStats && (
        <View style={styles.globalStats}>
          <Text variant="caption" color="muted" center style={styles.globalTitle}>
            All-Time Stats
          </Text>
          <View style={styles.globalStatsRow}>
            <View style={styles.globalStatItem}>
              <Text variant="body" weight="bold">
                {stats.globalStats.totalQuizzesEver}
              </Text>
              <Text variant="caption" color="muted">
                Total Quizzes
              </Text>
            </View>
            <View style={styles.globalStatItem}>
              <Text variant="body" weight="bold">
                {stats.globalStats.totalPointsEver.toLocaleString()}
              </Text>
              <Text variant="caption" color="muted">
                Total Points
              </Text>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seasonName: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    gap: 8,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  globalStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  globalTitle: {
    marginBottom: 12,
  },
  globalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  globalStatItem: {
    alignItems: 'center',
  },
  noStatsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});