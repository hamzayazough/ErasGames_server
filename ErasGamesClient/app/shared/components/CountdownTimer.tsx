import React from 'react';
import {
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {View} from '../../ui/View';
import {Text} from '../../ui/Text';
import {useTheme} from '../../core/theme';

const {width: screenWidth} = Dimensions.get('window');

interface CountdownTimerProps {
  /** Total seconds remaining */
  timeLeft: number;
  /** Optional title text above the timer */
  title?: string;
  /** Style overrides for the main container */
  containerStyle?: any;
  /** Style overrides for the title */
  titleStyle?: any;
  /** Style overrides for individual time boxes */
  timeBoxStyle?: any;
  /** Whether to show the background container */
  showBackground?: boolean;
  /** Size variant for the timer */
  size?: 'small' | 'medium' | 'large';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeLeft,
  title = "NEXT QUIZ IN",
  containerStyle,
  titleStyle,
  timeBoxStyle,
  showBackground = false,
  size = 'medium'
}) => {
  const theme = useTheme();
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const timeComponents = formatTime(timeLeft);
  
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.countdownWrapper, containerStyle]}>
      {showBackground && (
        <View style={[styles.dreamyContainer, {
          shadowColor: theme.name === 'dark' ? '#9d4edd' : '#c77dff',
          maxWidth: screenWidth - 40,
        }]}>
          <View style={styles.gradientOverlay} />
          
          {title && (
            <Text style={[
              styles.nextQuizLabel, 
              sizeStyles.title,
              { color: theme.colors.text },
              titleStyle
            ]}>
              {title}
            </Text>
          )}

          <View style={styles.countdownDisplay}>
            <TimeBox 
              value={timeComponents.hours} 
              label="HRS" 
              theme={theme}
              size={size}
              style={timeBoxStyle}
            />
            
            <Text style={[
              styles.timeSeparator, 
              sizeStyles.separator,
              { color: theme.colors.text }
            ]}>:</Text>
            
            <TimeBox 
              value={timeComponents.minutes} 
              label="MIN" 
              theme={theme}
              size={size}
              style={timeBoxStyle}
            />
            
            <Text style={[
              styles.timeSeparator, 
              sizeStyles.separator,
              { color: theme.colors.text }
            ]}>:</Text>
            
            <TimeBox 
              value={timeComponents.seconds} 
              label="SEC" 
              theme={theme}
              size={size}
              style={timeBoxStyle}
            />
          </View>
        </View>
      )}

      {!showBackground && (
        <>
          {title && (
            <Text style={[
              styles.nextQuizLabel, 
              sizeStyles.title,
              { color: theme.colors.text },
              titleStyle
            ]}>
              {title}
            </Text>
          )}

          <View style={styles.countdownDisplay}>
            <TimeBox 
              value={timeComponents.hours} 
              label="HRS" 
              theme={theme}
              size={size}
              style={timeBoxStyle}
            />
            
            <Text style={[
              styles.timeSeparator, 
              sizeStyles.separator,
              { color: theme.colors.text }
            ]}>:</Text>
            
            <TimeBox 
              value={timeComponents.minutes} 
              label="MIN" 
              theme={theme}
              size={size}
              style={timeBoxStyle}
            />
            
            <Text style={[
              styles.timeSeparator, 
              sizeStyles.separator,
              { color: theme.colors.text }
            ]}>:</Text>
            
            <TimeBox 
              value={timeComponents.seconds} 
              label="SEC" 
              theme={theme}
              size={size}
              style={timeBoxStyle}
            />
          </View>
        </>
      )}
    </View>
  );
};

interface TimeBoxProps {
  value: string;
  label: string;
  theme: any;
  size: 'small' | 'medium' | 'large';
  style?: any;
}

const TimeBox: React.FC<TimeBoxProps> = ({ value, label, theme, size, style }) => {
  const sizeStyles = getSizeStyles(size);
  
  return (
    <View style={[
      styles.timeBox,
      sizeStyles.timeBox,
      {
        backgroundColor: theme.name === 'dark' ? 'rgba(157, 78, 221, 0.15)' : 'rgba(199, 125, 255, 0.15)',
        borderColor: theme.name === 'dark' ? 'rgba(157, 78, 221, 0.3)' : 'rgba(199, 125, 255, 0.3)',
      },
      style
    ]}>
      <Text style={[
        styles.countdownTime, 
        sizeStyles.time,
        { color: theme.colors.text }
      ]}>
        {value}
      </Text>
      <Text style={[
        styles.timeLabel, 
        sizeStyles.label,
        { color: theme.colors.textSecondary }
      ]}>
        {label}
      </Text>
    </View>
  );
};

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        title: { fontSize: 14, letterSpacing: 2, marginBottom: 12 },
        time: { fontSize: 24, lineHeight: 28 },
        label: { fontSize: 8, marginTop: 1 },
        separator: { fontSize: 24 },
        timeBox: { 
          paddingHorizontal: 12, 
          paddingVertical: 8, 
          minWidth: 60, 
          minHeight: 55,
          borderRadius: 16 
        }
      };
    case 'large':
      return {
        title: { fontSize: 22, letterSpacing: 4, marginBottom: 28 },
        time: { fontSize: 40, lineHeight: 44 },
        label: { fontSize: 12, marginTop: 3 },
        separator: { fontSize: 40 },
        timeBox: { 
          paddingHorizontal: 20, 
          paddingVertical: 16, 
          minWidth: 90, 
          minHeight: 85,
          borderRadius: 24 
        }
      };
    default: // medium
      return {
        title: { fontSize: 19, letterSpacing: 3, marginBottom: 20 },
        time: { fontSize: 32, lineHeight: 36 },
        label: { fontSize: 10, marginTop: 2 },
        separator: { fontSize: 32 },
        timeBox: { 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          minWidth: 75, 
          minHeight: 70,
          borderRadius: 20 
        }
      };
  }
};

const styles = StyleSheet.create({
  countdownWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  dreamyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 32,
    marginHorizontal: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 300,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 32,
  },
  nextQuizLabel: {
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    opacity: 1,
    fontFamily: Platform.OS === 'ios' ? 'Arial Black' : 'sans-serif-black',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  countdownDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: 'rgba(157, 78, 221, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  countdownTime: {
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timeLabel: {
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timeSeparator: {
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default CountdownTimer;