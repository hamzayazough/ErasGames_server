import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import {View} from '../../ui/View';
import {Text} from '../../ui/Text';
import {useTheme} from '../../core/theme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';

// Simple icon components
const LeaderboardIcon = ({color, size}: {color: string; size: number}) => (
  <View style={[styles.iconContainer, {width: size, height: size}]}>
    {/* Three bars representing a leaderboard/ranking */}
    <View style={styles.leaderboardBars}>
      <View style={[
        styles.leaderboardBar,
        {
          backgroundColor: color,
          width: size * 0.15,
          height: size * 0.4,
        }
      ]} />
      <View style={[
        styles.leaderboardBar,
        {
          backgroundColor: color,
          width: size * 0.15,
          height: size * 0.6,
          marginHorizontal: size * 0.08,
        }
      ]} />
      <View style={[
        styles.leaderboardBar,
        {
          backgroundColor: color,
          width: size * 0.15,
          height: size * 0.3,
        }
      ]} />
    </View>
  </View>
);

const ProfileIcon = ({color, size}: {color: string; size: number}) => (
  <View style={[styles.iconContainer, {width: size, height: size}]}>
    <View style={[
      styles.profileCircle, 
      {
        width: size * 0.4,
        height: size * 0.4,
        borderRadius: size * 0.2,
        borderColor: color,
        borderWidth: 2,
      }
    ]} />
    <View style={[
      styles.profileBody,
      {
        width: size * 0.7,
        height: size * 0.35,
        borderRadius: size * 0.35,
        borderColor: color,
        borderWidth: 2,
        marginTop: size * 0.05,
      }
    ]} />
  </View>
);

const {width: screenWidth} = Dimensions.get('window');

interface GlobalHeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
  showLeaderboard?: boolean;
  isLeaderboardActive?: boolean;
  isProfileActive?: boolean;
  onProfilePress?: () => void;
  onLeaderboardPress?: () => void;
}

export default function GlobalHeader({
  title,
  showBack = true,
  showProfile = true,
  showLeaderboard = true,
  isLeaderboardActive = false,
  isProfileActive = false,
  onProfilePress,
  onLeaderboardPress,
}: GlobalHeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      // Default navigation to profile
      navigation.navigate('Profile', {userId: undefined});
    }
  };

  const handleLeaderboardPress = () => {
    if (onLeaderboardPress) {
      onLeaderboardPress();
    } else {
      navigation.navigate('Leaderboard');
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      <View style={[styles.container, {backgroundColor: 'transparent'}]}>
        {/* Left Side - Back Button */}
        <View style={styles.leftSection}>
          {showBack && navigation.canGoBack() && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={[styles.headerButton, {backgroundColor: theme.colors.accent4}]}
              activeOpacity={0.8}
            >
              <Text style={[styles.backIcon, {color: theme.colors.text}]}>
                ←
              </Text>
            </TouchableOpacity>
          )}
        </View>


        {/* Right Side - Profile & Leaderboard */}
        <View style={styles.rightSection}>
          {showLeaderboard && (
            <TouchableOpacity
              onPress={isLeaderboardActive ? undefined : handleLeaderboardPress}
              style={[
                styles.headerButton, 
                {
                  backgroundColor: isLeaderboardActive 
                    ? theme.colors.primary 
                    : theme.colors.accent4
                }
              ]}
              activeOpacity={isLeaderboardActive ? 1 : 0.8}
              disabled={isLeaderboardActive}
            >
              <LeaderboardIcon 
                color={isLeaderboardActive ? theme.colors.textOnPrimary : theme.colors.text} 
                size={20} 
              />
            </TouchableOpacity>
          )}
          
          {showProfile && (
            <TouchableOpacity
              onPress={isProfileActive ? undefined : handleProfilePress}
              style={[
                styles.headerButton, 
                styles.profileButton, 
                {
                  backgroundColor: isProfileActive 
                    ? theme.colors.primary 
                    : theme.colors.accent4
                }
              ]}
              activeOpacity={isProfileActive ? 1 : 0.8}
              disabled={isProfileActive}
            >
              <ProfileIcon 
                color={isProfileActive ? theme.colors.textOnPrimary : theme.colors.text} 
                size={20} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 70,
    ...Platform.select({
      ios: {
        paddingTop: 16,
      },
      android: {
        paddingTop: 12,
      },
    }),
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  retroButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  profileButton: {
    marginLeft: 12,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  iconText: {
    fontSize: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  profileCircle: {
    backgroundColor: 'transparent',
  },
  profileBody: {
    backgroundColor: 'transparent',
  },
  leaderboardBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
  },
  leaderboardBar: {
    borderRadius: 2,
  },
});