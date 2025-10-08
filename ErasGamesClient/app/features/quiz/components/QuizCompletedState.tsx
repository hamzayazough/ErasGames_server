import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../ui/Text';
import {Button} from '../../../ui/Button';
import {useTheme} from '../../../core/theme';
import {CountdownTimer} from '../../../shared/components';
import type {RootStackScreenProps} from '../../../navigation/types';

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
    <View style={styles.dreamyContainer}>
      <Text style={[styles.completedTitle, { color: theme.colors.text }]}>
        QUIZ COMPLETED!
      </Text>
      
      <Text style={[styles.scoreText, { color: theme.colors.textSecondary }]}>
        Your Got {score} points
      </Text>

      <Text style={[styles.seeYouTomorrowText, { color: theme.colors.textMuted }]}>
        See you back tomorrow!
      </Text>

      {/* Countdown Timer for window end */}
      <CountdownTimer
        timeLeft={nextDayTimeLeft}
        title=""
        showBackground={true}
        size="medium"
        containerStyle={styles.timerContainer}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  dreamyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 32,
    margin: 16,
    shadowColor: '#c77dff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    minWidth: 320,
    maxWidth: 500,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  seeYouTomorrowText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  detailsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  timerContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});