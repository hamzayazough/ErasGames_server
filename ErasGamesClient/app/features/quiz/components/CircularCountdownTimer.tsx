import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../ui/Text';
import {useTheme} from '../../../core/theme';

interface CircularCountdownTimerProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
}

export function CircularCountdownTimer({ 
  timeLeft, 
  totalTime, 
  size = 120 
}: CircularCountdownTimerProps) {
  const theme = useTheme();
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Color based on time remaining - using theme colors
  const getColor = () => {
    if (timeLeft > 1800) return theme.colors.success; // > 30 min - green
    if (timeLeft > 600) return theme.colors.warning; // > 10 min - orange  
    return theme.colors.error; // < 10 min - red
  };
  
  // Calculate progress - how much time is left (1.0 = full, 0.0 = empty)
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  
  return (
    <View style={[styles.circularTimer, { width: size, height: size }]}>
      {/* Background circle */}
      <View style={[
        styles.circularTimerBg,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 6,
          borderColor: theme.colors.accent4,
          backgroundColor: 'transparent',
        }
      ]} />
      
      {/* Progress circle */}
      <View style={[
        styles.circularTimerProgress,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 6,
          position: 'absolute',
          transform: [{ rotate: '-90deg' }],
          borderTopColor: progress > 0 ? getColor() : theme.colors.accent4,
          borderRightColor: progress > 0.25 ? getColor() : theme.colors.accent4,
          borderBottomColor: progress > 0.5 ? getColor() : theme.colors.accent4,
          borderLeftColor: progress > 0.75 ? getColor() : theme.colors.accent4,
        }
      ]} />
      
      {/* Time display */}
      <View style={styles.circularTimerText}>
        <Text style={[styles.timerTime, { color: theme.colors.textSecondary }]}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  circularTimer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularTimerBg: {
    position: 'absolute',
  },
  circularTimerProgress: {
    position: 'absolute',
  },
  circularTimerText: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  timerTime: {
    fontWeight: '300',
    fontSize: 18,
    fontFamily: 'monospace',
  },
});