import React from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import {View, Text} from '../../../ui';
import {useTheme, ThemedBackground} from '../../../core/theme';
import GlobalHeader from '../../../shared/components/GlobalHeader';
import {useLeaderboard} from '../hooks/useLeaderboard';
import {SeasonBanner, MyStatsCard, PlayerCard} from '../components';
import {TopPlayer, SeasonLeaderboard, SeasonTopPlayers} from '../../../core/api/seasons';

export default function LeaderboardScreen() {
  const theme = useTheme();
  const {
    seasonInfo,
    leaderboard,
    myStats,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useLeaderboard();

  const getPlayers = (): TopPlayer[] => {
    if (!leaderboard) return [];
    
    if ('topPlayers' in leaderboard) {
      return leaderboard.topPlayers;
    }
    
    if ('players' in leaderboard) {
      return leaderboard.players;
    }
    
    return [];
  };

  const getCurrentUserId = (): string | undefined => {
    // This would come from your auth context/service
    // For now, we'll check if myStats has user data
    return myStats?.hasStats ? 'current-user' : undefined;
  };

  const handlePlayerPress = (player: TopPlayer) => {
    Alert.alert(
      `${player.handle}'s Stats`,
      `Rank: #${player.rank}\nPoints: ${player.totalPoints.toLocaleString()}\nStreak: ${player.currentStreak}\nPerfect Scores: ${player.perfectScores}`,
      [{text: 'OK'}]
    );
  };

  const renderPlayer = ({item, index}: {item: TopPlayer; index: number}) => {
    const currentUserId = getCurrentUserId();
    const isCurrentUser = currentUserId && 
      (myStats?.stats?.participation.currentRank === item.rank);

    return (
      <PlayerCard
        player={item}
        onPress={() => handlePlayerPress(item)}
        isCurrentUser={isCurrentUser}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="h3" center style={styles.emptyTitle}>
        🏆 No Leaderboard Yet
      </Text>
      <Text variant="body" color="secondary" center>
        {error || 'The leaderboard will appear when the season becomes active and players start competing!'}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <Text variant="body" color="secondary" center>
        Loading leaderboard...
      </Text>
    </View>
  );

  const players = getPlayers();
  const hasPlayers = players.length > 0;

  return (
    <ThemedBackground>
      <GlobalHeader 
        showBack={true} 
        showProfile={true}
        showLeaderboard={true}
        isLeaderboardActive={true}
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Season Info Banner */}
        {seasonInfo && <SeasonBanner seasonInfo={seasonInfo} />}

        {/* My Stats Card (if user is authenticated and has stats) */}
        {myStats && <MyStatsCard stats={myStats} />}

        {/* Error State */}
        {error && !isLoading && !hasPlayers && (
          <View style={styles.errorContainer}>
            <Text variant="body" color="error" center>
              {error}
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && renderLoadingState()}

        {/* Leaderboard List */}
        {!isLoading && hasPlayers && (
          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardHeader}>
              <Text variant="h3" weight="bold">
                🏆 Top Players
              </Text>
              <Text variant="caption" color="muted">
                {leaderboard && 'totalParticipants' in leaderboard && 
                  `${leaderboard.totalParticipants} total players`}
              </Text>
            </View>

            <FlatList
              data={players}
              renderItem={renderPlayer}
              keyExtractor={(item, index) => `${item.userId}-${index}`}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !hasPlayers && !error && renderEmptyState()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  leaderboardContainer: {
    marginTop: 8,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  separator: {
    height: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: 16,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorContainer: {
    padding: 20,
    margin: 16,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.2)',
  },
  bottomSpacing: {
    height: 40,
  },
});