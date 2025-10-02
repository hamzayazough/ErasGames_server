import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {View, Text} from '../../../ui';
import {useTheme} from '../../../core/theme';
import {TopPlayer} from '../../../core/api/seasons';

interface PlayerCardProps {
  player: TopPlayer;
  onPress?: () => void;
  isCurrentUser?: boolean;
}

export function PlayerCard({player, onPress, isCurrentUser}: PlayerCardProps) {
  const theme = useTheme();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return theme.colors.textSecondary;
    }
  };

  const cardStyle = [
    styles.container,
    {
      backgroundColor: isCurrentUser ? theme.colors.accent2 : theme.colors.card,
      borderColor: isCurrentUser ? theme.colors.primary : theme.colors.border,
      borderWidth: isCurrentUser ? 2 : 1,
    },
  ];

  const content = (
    <View style={cardStyle}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        <Text
          style={[
            styles.rankText,
            {color: getRankColor(player.rank)},
            player.rank <= 3 && styles.topRankText,
          ]}
        >
          {getRankIcon(player.rank)}
        </Text>
      </View>

      {/* Player Info */}
      <View style={styles.playerInfo}>
        <View style={styles.playerHeader}>
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {player.handle || 'Anonymous'}
          </Text>
          {player.country && (
            <Text variant="caption" color="muted">
              {player.country}
            </Text>
          )}
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="caption" color="muted">
              Points
            </Text>
            <Text variant="body" weight="medium">
              {player.totalPoints.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="caption" color="muted">
              Streak
            </Text>
            <Text variant="body" weight="medium">
              {player.currentStreak}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text variant="caption" color="muted">
              Perfect
            </Text>
            <Text variant="body" weight="medium">
              {player.perfectScores}
            </Text>
          </View>
        </View>
      </View>

      {/* Current User Badge */}
      {isCurrentUser && (
        <View style={[styles.currentUserBadge, {backgroundColor: theme.colors.primary}]}>
          <Text variant="caption" color="textOnPrimary" weight="medium">
            YOU
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topRankText: {
    fontSize: 24,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  currentUserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
});