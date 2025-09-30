import React from 'react';
import {View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform} from 'react-native';
import {Text} from '../../../ui/Text';
import {useTheme} from '../../../core/theme';
import {CountdownTimer, AnimatedActionButton} from '../../../shared/components';
import { FONTS } from '../../../core/config/fonts';

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
    // Quiz In Progress State - Dreamy theme
    return (
      <>
      {/* Main Continue Quiz Button - Large Circular Design */}
      <View style={styles.centerButtonContainer}>
        <Text style={[styles.startNowText, { color: theme.colors.text }]}>Continue NOW</Text>
        <TouchableOpacity
          style={[styles.circularStartButton, {
            backgroundColor: theme.currentMode === 'main' ? theme.colors.accent4 : theme.colors.primary,
            shadowColor: theme.currentMode === 'main' ? theme.colors.accent4 : theme.colors.primary,
          }]}
          onPress={onStartQuiz}
          disabled={isStartingQuiz}
          activeOpacity={0.8}
        >
          {isStartingQuiz ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.textOnPrimary}
            />
          ) : (
            <View style={[styles.triangleIcon, { 
              borderLeftColor: theme.colors.textOnPrimary
            }]} />
          )}
        </TouchableOpacity>
      </View>        {/* Countdown Timer below button */}
        <View style={styles.dreamyContainer}>
          <Text style={[styles.nextQuizLabel, { color: theme.colors.textSecondary }]}>QUIZ IN PROGRESS!</Text>
          <CountdownTimer
            timeLeft={quizWindowTimeLeft}
            title="TIME LEFT TO FINISH"
            showBackground={true}
            size="medium"
          />
          {onHowToPlay && (
            <TouchableOpacity onPress={onHowToPlay} activeOpacity={0.7} style={styles.howToPlayContainer}>
              <Text style={[styles.howToPlayText, { color: theme.colors.textSecondary }]}>How to Play</Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  }

  // Quiz Available State - Dreamy pastel theme
  return (
    <>
      {/* Main Start Quiz Button - Large Circular Design */}
      <View style={styles.centerButtonContainer}>
        <Text style={[styles.startNowText, { color: theme.colors.text }]}>Start NOW</Text>
        <TouchableOpacity
          style={[styles.circularStartButton, {
            backgroundColor: theme.currentMode === 'main' ? theme.colors.accent4 : theme.colors.primary,
            shadowColor: theme.currentMode === 'main' ? theme.colors.accent4 : theme.colors.primary,
          }]}
          onPress={onStartQuiz}
          disabled={isStartingQuiz}
          activeOpacity={0.8}
        >
          {isStartingQuiz ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.textOnPrimary}
            />
          ) : (
            <View style={[styles.triangleIcon, { 
              borderLeftColor: theme.currentMode === 'main' ? theme.colors.textOnPrimary : theme.colors.textOnPrimary
            }]} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Countdown Timer below button */}
      <View style={styles.dreamyContainer}>
        <CountdownTimer
          timeLeft={quizWindowTimeLeft}
          title="TIME LEFT"
          showBackground={true}
          size="medium"
        />
        {onHowToPlay && (
          <TouchableOpacity onPress={onHowToPlay} activeOpacity={0.7} style={styles.howToPlayContainer}>
            <Text style={[styles.howToPlayText, { color: theme.colors.textSecondary }]}>How to Play</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
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
  buttonContainer: {
    marginTop: 32,
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
    marginTop: 24,
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
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingVertical: 0,
  },
  startNowText: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Arial Black' : 'sans-serif-black',
    textAlign: 'center',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  circularStartButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
    // Add subtle border for definition
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  triangleIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderRightWidth: 0,
    borderBottomWidth: 20,
    borderTopWidth: 20,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    borderRadius: 8,
    // Slightly offset to the right to center the visual weight
    marginLeft: 8,
  },
  // Keep legacy styles for backward compatibility
  startQuizButton: {
    paddingHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: 'rgba(255, 105, 180, 0.6)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startQuizButtonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  centerLoadingIndicator: {
    marginTop: 12,
  },
});