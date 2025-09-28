import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../ui/Text';
import {useTheme} from '../../../core/theme';
import {CircularCountdownTimer} from './CircularCountdownTimer';

interface QuizCompletedStateProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken?: string;
  nextDayTimeLeft: number;
  nextDayTotalTime: number;
}

export function QuizCompletedState({
  score,
  correctAnswers,
  totalQuestions,
  timeTaken,
  nextDayTimeLeft,
  nextDayTotalTime
}: QuizCompletedStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Simple completion message matching original clean design */}
      <Text style={[styles.completedMessage, { color: theme.colors.textSecondary }]}>
        Quiz completed! Your score: {score}
      </Text>
      
      <Text style={[styles.completedSubtext, { color: theme.colors.textSecondary }]}>
        ({correctAnswers}/{totalQuestions} correct)
      </Text>

      {/* Next Quiz Label */}
      <Text style={[styles.nextQuizLabel, { color: theme.colors.textSecondary }]}>
        QUIZ WINDOW ENDS IN
      </Text>

      {/* Countdown Timer for window end */}
      <View style={styles.timerContainer}>
        <CircularCountdownTimer 
          timeLeft={nextDayTimeLeft}
          totalTime={nextDayTotalTime}
          size={120}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completedMessage: {
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 8,
  },
  completedSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  nextQuizLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  timerContainer: {
    alignItems: 'center',
  },
});