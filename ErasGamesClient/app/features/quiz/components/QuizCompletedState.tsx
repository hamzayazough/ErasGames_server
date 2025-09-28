import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../ui/Text';
import {Button} from '../../../ui/Button';
import {useTheme} from '../../../core/theme';
import {CircularCountdownTimer} from './CircularCountdownTimer';
import type {RootStackScreenProps} from '../../../navigation/types';

interface QuizCompletedStateProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken?: string;
  nextDayTimeLeft: number;
  nextDayTotalTime: number;
  navigation: RootStackScreenProps<'DailyDrop'>['navigation'];
}

export function QuizCompletedState({
  score,
  correctAnswers,
  totalQuestions,
  timeTaken,
  nextDayTimeLeft,
  nextDayTotalTime,
  navigation
}: QuizCompletedStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Simple completion message matching original clean design */}
      <Text style={[styles.completedMessage, { color: theme.colors.textSecondary }]}>
        Quiz completed! Your scored
      </Text>
      <Text style={[styles.completedMessage, { color: theme.colors.textSecondary }]}>
        {score} points
      </Text>
      

      {/* Next Quiz Label */}
      <Text style={[styles.nextQuizLabel, { color: theme.colors.textSecondary }]}>
        TODAY QUIZ ENDS IN
      </Text>

      {/* Countdown Timer for window end */}
      <View style={styles.timerContainer}>
        <CircularCountdownTimer 
          timeLeft={nextDayTimeLeft}
          totalTime={nextDayTotalTime}
          size={120}
        />
      </View>

      {/* Practice Button */}
      <Button
        title="Practice demo quizzes"
        variant="outline"
        onPress={() => navigation.navigate('QuizSelection')}
        style={styles.practiceButton}
      />
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
    fontWeight: '900',
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
    marginBottom: 30,
  },
  practiceButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
  },
});