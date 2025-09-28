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
  
  // Progress calculation (0 to 1)
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  
  // Calculate the stroke dash array for the progress circle
  const radius = (size - 8) / 2; // Account for border width
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Retro-styled circular progress indicator */}
      <View style={[
        styles.circleContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}>
        {/* Progress ring - using a simple approach with border */}
        <View style={[
          styles.progressRing,
          {
            width: size - 12,
            height: size - 12,
            borderRadius: (size - 12) / 2,
            borderWidth: 8,
            borderColor: progress > 0.1 ? theme.colors.textSecondary : 'transparent',
            position: 'absolute',
            top: 6,
            left: 6,
            opacity: progress > 0 ? 1 : 0.3,
          }
        ]} />
        
        {/* Time display */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    backgroundColor: 'transparent',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});