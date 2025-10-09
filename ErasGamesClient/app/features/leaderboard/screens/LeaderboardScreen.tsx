import React from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {View, Text, Card} from '../../../ui';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {useLeaderboard} from '../hooks/useLeaderboard';
import {TopPlayer} from '../../../core/api/seasons';
import {GlobalHeader, AnimatedLogo} from '../../../shared/components';

const {width: screenWidth} = Dimensions.get('window');

export default function LeaderboardScreen({ navigation }: { navigation?: any }) {
  const theme = useTheme();
  const {
    leaderboard,
    myStats,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useLeaderboard();

  // Handle error state
  if (error && !isLoading) {
    return (
      <ThemedBackground style={styles.container}>
        <GlobalHeader 
          title="SEASON LEADERBOARD"
          showBack={true}
          onBackPress={() => navigation?.goBack()}
        />
        <View style={styles.centerContent}>
          <AnimatedLogo size={120} />
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Oops!
          </Text>
          <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
            Unable to load leaderboard
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={refresh}
            activeOpacity={0.8}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary || '#FFFFFF' }]}>
              🔄 Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedBackground>
    );
  }

  // Get players from leaderboard response
  const getPlayers = (): TopPlayer[] => {
    if (!leaderboard) return [];
    
    if ('topPlayers' in leaderboard) {
      return leaderboard.topPlayers;
    }
    
    if ('players' in leaderboard) {
      return (leaderboard as any).players;
    }
    
    return [];
  };

  const leaderboardData = getPlayers();
  const currentUserRank = myStats?.hasStats ? myStats.stats?.participation.currentRank : null;

  // Get rank colors based on position
  const getRankColors = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return {
        backgroundColor: theme.colors.primary + '20',
        borderColor: theme.colors.primary,
        textColor: theme.colors.primary,
        nameColor: theme.colors.text,
      };
    }

    switch (rank) {
      case 1:
        return {
          backgroundColor: '#FFD700' + '20', // Gold
          borderColor: '#FFD700',
          textColor: '#B8860B',
          nameColor: theme.colors.text,
        };
      case 2:
        return {
          backgroundColor: '#C0C0C0' + '20', // Silver
          borderColor: '#C0C0C0',
          textColor: '#808080',
          nameColor: theme.colors.text,
        };
      case 3:
        return {
          backgroundColor: '#CD7F32' + '20', // Bronze
          borderColor: '#CD7F32',
          textColor: '#8B4513',
          nameColor: theme.colors.text,
        };
      default:
        return {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border || 'transparent',
          textColor: theme.colors.textSecondary,
          nameColor: theme.colors.text,
        };
    }
  };

  // Get avatar background color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Turquoise
      '#45B7D1', // Blue
      '#96CEB4', // Mint Green
      '#FFEAA7', // Yellow
      '#DDA0DD', // Plum
      '#FF8A65', // Orange
      '#81C784', // Green
      '#BA68C8', // Purple
      '#64B5F6', // Light Blue
      '#FFB74D', // Amber
      '#F06292', // Pink
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get first letter for avatar
  const getAvatarLetter = (player: TopPlayer, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'Y';
    const name = player.name || player.handle || 'U';
    return name.charAt(0).toUpperCase();
  };

  // Helper functions for clean design
  const getCleanAvatarStyle = (rank: number, isCurrentUser: boolean, avatarColor: string) => {
    const baseStyle = { ...styles.cleanAvatar };
    
    if (isCurrentUser) {
      return { 
        ...baseStyle, 
        backgroundColor: '#8A2BE2',
        borderWidth: 2,
        borderColor: '#9370DB',
      };
    }
    
    return { 
      ...baseStyle, 
      backgroundColor: avatarColor,
    };
  };

  const getRankTextColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return '#8A2BE2';
    if (rank <= 3) return '#8A2BE2'; // Purple for top 3
    return '#666666'; // Gray for others
  };

  const getPlayerTextColor = (isCurrentUser: boolean) => {
    return isCurrentUser ? '#8A2BE2' : '#2D1B69';
  };

  // Render clean player row (like reference design)
  const renderCleanPlayerRow = (player: TopPlayer, index: number) => {
    const isCurrentUser = currentUserRank === player.rank;
    const displayName = isCurrentUser ? 'You' : (player.name || player.handle);
    const avatarLetter = getAvatarLetter(player, isCurrentUser);
    const avatarColor = getAvatarColor(displayName);

    // Get medal emoji for top 3
    const getMedalEmoji = (rank: number) => {
      switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return null;
      }
    };

    const medal = getMedalEmoji(player.rank);

    return (
      <TouchableOpacity
        key={`player-${player.userId}-${index}`}
        style={[
          styles.cleanPlayerRow,
          isCurrentUser && styles.currentUserHighlight
        ]}
        activeOpacity={0.7}
      >
        {/* Rank Number */}
        <Text style={[
          styles.rankNumber,
          { 
            color: getRankTextColor(player.rank, isCurrentUser),
            fontWeight: isCurrentUser ? '900' : player.rank <= 3 ? '800' : '600'
          }
        ]}>
          {player.rank}
        </Text>

        {/* Avatar */}
        <View style={getCleanAvatarStyle(player.rank, isCurrentUser, avatarColor)}>
          <Text style={styles.cleanAvatarText}>{avatarLetter}</Text>
        </View>

        {/* Player Info */}
        <View style={styles.cleanPlayerInfo}>
          <Text style={[
            styles.cleanPlayerName,
            { 
              color: getPlayerTextColor(isCurrentUser),
              fontWeight: isCurrentUser ? '800' : '700'
            }
          ]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[
            styles.cleanPlayerScore,
            { 
              color: isCurrentUser ? 'rgba(138, 43, 226, 0.7)' : '#666666',
              fontWeight: '600'
            }
          ]}>
            {player.totalPoints.toLocaleString()} points
          </Text>
        </View>

        {/* Medal (if top 3) */}
        {medal && (
          <View style={styles.medalContainer}>
            <Text style={styles.medalEmoji}>{medal}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <ThemedBackground style={styles.container}>
        <GlobalHeader 
          title="SEASON LEADERBOARD"
          showBack={true}
          onBackPress={() => navigation?.goBack()}
        />
        <View style={styles.centerContent}>
          <AnimatedLogo size={200} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading leaderboard...
          </Text>
        </View>
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground style={styles.container}>
      <GlobalHeader 
        title="Leaderboard"
        showBack={true}
        onBackPress={() => navigation?.goBack()}
        onProfilePress={() => navigation?.navigate?.('Profile', {userId: undefined})}
        onLeaderboardPress={() => {}} // Already on leaderboard
      />

      {/* Leaderboard Title Image */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={require('../../../assets/images/main-theme/main-leaderboard-title.png')}
          style={styles.leaderboardTitleImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {/* Simple Clean Leaderboard List */}
        {leaderboardData.length > 0 ? (
          leaderboardData.map((player, index) => renderCleanPlayerRow(player, index))
        ) : (
          <View style={styles.emptyContainer}>
            <AnimatedLogo size={120} />
            <Text style={styles.emptyTitle}>Ready to Compete?</Text>
            <Text style={styles.emptyText}>
              Be the first to join the leaderboard! 🚀
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2D1B69',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Header Image Container
  headerImageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  leaderboardTitleImage: {
    width: screenWidth * 0.8, // 80% of screen width
    height: 60, // Fixed height for title
    maxWidth: 300, // Maximum width constraint
  },

  // Clean Player Row (like reference design)
  cleanPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserHighlight: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },

  // Rank Number
  rankNumber: {
    fontSize: 18,
    fontWeight: '800',
    width: 32,
    textAlign: 'center',
    marginRight: 16,
  },

  // Clean Avatar (simple circular)
  cleanAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cleanAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Player Info
  cleanPlayerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cleanPlayerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cleanPlayerScore: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Medal Container
  medalContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medalEmoji: {
    fontSize: 24,
  },
  // Empty State
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D1B69', // Dark purple for better contrast
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#5A4B7C', // Medium purple for secondary text
    lineHeight: 24,
  },
  
  // Error State
  errorEmoji: {
    fontSize: 48,
    marginTop: 16,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2D1B69', // Dark purple for better contrast  
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5A4B7C', // Medium purple
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
    textAlign: 'center',
    color: '#5A4B7C', // Medium purple for better readability
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  
  bottomPadding: {
    height: 60,
  },
});