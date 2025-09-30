import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, Card} from '../../../ui';
import {useTheme} from '../../../core/theme';
import {SeasonInfo} from '../../../core/api/seasons';

interface SeasonBannerProps {
  seasonInfo: SeasonInfo;
}

export function SeasonBanner({seasonInfo}: SeasonBannerProps) {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (seasonInfo.status) {
      case 'active':
        return theme.colors.success;
      case 'upcoming':
        return theme.colors.warning;
      case 'ended':
        return theme.colors.textMuted;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (seasonInfo.status) {
      case 'active':
        return '🔥';
      case 'upcoming':
        return '⏰';
      case 'ended':
        return '🏁';
      default:
        return '📊';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h3" weight="bold">
          {getStatusIcon()} Season Leaderboard
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor()},
          ]}
        >
          <Text variant="caption" color="textOnPrimary" weight="medium">
            {seasonInfo.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {seasonInfo.hasSeason && seasonInfo.season ? (
        <View style={styles.seasonInfo}>
          <Text variant="body" weight="medium" style={styles.seasonTitle}>
            {seasonInfo.season.displayName}
          </Text>
          
          <Text variant="body" color="secondary" style={styles.message}>
            {seasonInfo.message}
          </Text>

          {seasonInfo.status === 'active' && seasonInfo.daysRemaining !== undefined && (
            <View style={styles.progressContainer}>
              <Text variant="caption" color="muted">
                {seasonInfo.daysRemaining} days remaining{seasonInfo.season?.progress !== undefined ? ` • ${seasonInfo.season.progress.toFixed(1)}% complete` : ''}
              </Text>
              
              <View style={[styles.progressBar, {backgroundColor: theme.colors.borderLight}]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${seasonInfo.season?.progress || 0}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {seasonInfo.status === 'upcoming' && seasonInfo.daysUntilStart !== undefined && (
            <View style={styles.countdownContainer}>
              <Text variant="caption" color="muted">
                Starts in {seasonInfo.daysUntilStart} days
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noSeasonContainer}>
          <Text variant="body" color="secondary" center>
            {seasonInfo.message}
          </Text>
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
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seasonInfo: {
    gap: 8,
  },
  seasonTitle: {
    marginBottom: 4,
  },
  message: {
    marginBottom: 8,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  countdownContainer: {
    alignItems: 'center',
    padding: 8,
  },
  noSeasonContainer: {
    padding: 20,
  },
});