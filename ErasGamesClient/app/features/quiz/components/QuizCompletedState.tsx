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
    <View style={styles.dreamyContainer}>
      {/* Quiz completion celebration */}
      <Text style={[styles.celebrationEmoji, { color: theme.colors.text }]}>
        🎉
      </Text>
      
      <Text style={[styles.completedTitle, { color: theme.colors.text }]}>
        QUIZ COMPLETED!
      </Text>
      
      <Text style={[styles.scoreText, { color: theme.colors.textSecondary }]}>
        Your Score: {score}%
      </Text>
      
      <Text style={[styles.detailsText, { color: theme.colors.textSecondary }]}>
        {correctAnswers} out of {totalQuestions} correct
        {timeTaken && ` • ${timeTaken}`}
      </Text>

      {/* Countdown Timer for window end */}
      <CountdownTimer
        timeLeft={nextDayTimeLeft}
        title="QUIZ WINDOW ENDS IN"
        showBackground={true}
        size="medium"
        containerStyle={styles.timerContainer}
      />

      {/* Practice Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Practice Demo Quizzes"
          variant="outline"
          onPress={() => navigation.navigate('QuizSelection')}
          style={styles.practiceButton}
        />
      </View>
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
  practiceButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 220,
    borderRadius: 25,
  },
});