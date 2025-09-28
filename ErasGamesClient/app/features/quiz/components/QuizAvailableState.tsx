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
  onHowToPlay?: () => void;
}

export function QuizAvailableState({
  hasAttempt,
  attemptCompleted,
  quizWindowTimeLeft,
  isStartingQuiz,
  onStartQuiz,
  onHowToPlay
}: QuizAvailableStateProps) {
  const theme = useTheme();

  if (hasAttempt && !attemptCompleted) {
    // Quiz In Progress State - Clean minimal design
    return (
      <View style={styles.container}>
        {/* Quiz In Progress Message */}
        <Text style={[styles.nextQuizLabel, { color: theme.colors.textSecondary }]}>
          QUIZ IN PROGRESS!
        </Text>
        
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
          
          {/* How to Play text below button */}
          {onHowToPlay && (
            <TouchableOpacity onPress={onHowToPlay} activeOpacity={0.7} style={styles.howToPlayContainer}>
              <Text style={[styles.howToPlayText, { color: theme.colors.textSecondary }]}>
                How do you play?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Quiz Available State - Clean minimal design matching original theme
    return (
      <View style={styles.container}>
        {/* Quiz Available Message */}
        <Text style={[styles.nextQuizLabel, { color: theme.colors.textSecondary }]}>
          QUIZ IS AVAILABLE NOW!
        </Text>
        
        {/* Quiz window countdown - simple and clean */}
        <View style={styles.timerContainer}>
          <CircularCountdownTimer 
            timeLeft={quizWindowTimeLeft}
            totalTime={3600} // 1 hour = 3600 seconds
            size={120}
          />
        </View>      {/* Start Quiz Button */}
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
        
        {/* How to Play text below button */}
        {onHowToPlay && (
          <TouchableOpacity onPress={onHowToPlay} activeOpacity={0.7} style={styles.howToPlayContainer}>
            <Text style={[styles.howToPlayText, { color: theme.colors.textSecondary }]}>
              How do you play?
            </Text>
          </TouchableOpacity>
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
  howToPlayContainer: {
    marginTop: 20,
    alignSelf: 'center',
  },
  howToPlayText: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  nextQuizLabel: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
});