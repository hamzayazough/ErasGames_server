import React from 'react';
import {View, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Text} from '../../../ui/Text';
import {useTheme} from '../../../core/theme';
import {CircularCountdownTimer} from './CircularCountdownTimer';

interface QuizAvailableStateProps {
  hasAttempt: boolean;
  attemptCompleted: boolean;
  quizWindowTimeLeft: number;
  isStartingQuiz: boolean;
  onStartQuiz: () => void;
}

export function QuizAvailableState({
  hasAttempt,
  attemptCompleted,
  quizWindowTimeLeft,
  isStartingQuiz,
  onStartQuiz
}: QuizAvailableStateProps) {
  const theme = useTheme();

  if (hasAttempt && !attemptCompleted) {
    // Quiz In Progress State - Clean minimal design
    return (
      <View style={styles.container}>
        {/* Quiz window countdown - simple and clean */}
        <View style={styles.timerContainer}>
          <CircularCountdownTimer 
            timeLeft={quizWindowTimeLeft}
            totalTime={3600} // 1 hour = 3600 seconds
            size={120}
          />
        </View>

        {/* Start/Continue Quiz Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={onStartQuiz}
            disabled={isStartingQuiz}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.textOnPrimary }]}>
              {isStartingQuiz ? "Starting..." : "Continue Quiz"}
            </Text>
          </TouchableOpacity>
          
          {isStartingQuiz && (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary} 
              style={styles.loadingIndicator}
            />
          )}
        </View>
      </View>
    );
  }

  // Quiz Available State - Clean minimal design matching original theme
  return (
    <View style={styles.container}>
      {/* Quiz window countdown - simple and clean */}
      <View style={styles.timerContainer}>
        <CircularCountdownTimer 
          timeLeft={quizWindowTimeLeft}
          totalTime={3600} // 1 hour = 3600 seconds
          size={120}
        />
      </View>

      {/* Start Quiz Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={onStartQuiz}
          disabled={isStartingQuiz}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.textOnPrimary }]}>
            {isStartingQuiz ? "Starting..." : "Start Quiz"}
          </Text>
        </TouchableOpacity>
        
        {isStartingQuiz && (
          <ActivityIndicator 
            size="small" 
            color={theme.colors.primary} 
            style={styles.loadingIndicator}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: -80, // Position similar to original design
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 35,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  actionButtonText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  loadingIndicator: {
    marginTop: 12,
  },
});