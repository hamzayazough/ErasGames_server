import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {useDailyQuizStatus, useDailyQuizErrorHandler} from '../hooks/useDailyQuiz';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'DailyDrop'>;

export default function DailyDropScreen({navigation}: Props) {
  const theme = useTheme();
  
  // Use the new consolidated hook that handles everything
  const { 
    status, 
    isLoading, 
    error, 
    refresh,
    isAvailable,
    hasAttempt,
    attemptCompleted,
    timeUntilDrop
  } = useDailyQuizStatus();
  
  const { getErrorMessage, shouldShowRetry } = useDailyQuizErrorHandler();
  
  // Use refs to prevent excessive API calls
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Local countdown state for smooth UI updates
  const [localTimeLeft, setLocalTimeLeft] = useState(0);

  // Initialize local countdown from server data  
  useEffect(() => {
    setLocalTimeLeft(timeUntilDrop);
  }, [timeUntilDrop]);

  // Countdown timer for smooth UI updates
  useEffect(() => {
    if (localTimeLeft > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setLocalTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [localTimeLeft]);

  // Auto-refresh when quiz should be available (every 30 seconds when countdown is low)
  useEffect(() => {
    if (timeUntilDrop > 0 && timeUntilDrop < 300) { // 5 minutes or less
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Auto-refreshing quiz status...');
        refresh();
      }, 30000); // Refresh every 30 seconds when close to drop
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [timeUntilDrop, refresh]);

  const handleStartQuiz = async () => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK' },
        { text: 'Retry', onPress: refresh }
      ]);
      return;
    }

    if (hasAttempt && attemptCompleted) {
      Alert.alert(
        'Quiz Already Completed',
        `You've already completed today's quiz! Your score was ${status?.attempt?.score || 0}. Come back tomorrow for a new quiz.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (hasAttempt && !attemptCompleted) {
      Alert.alert(
        'Continue Quiz',
        'You have an in-progress quiz. Would you like to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => navigation.navigate('Quiz', { selectedQuiz: undefined }) }
        ]
      );
      return;
    }

    if (isAvailable) {
      navigation.navigate('Quiz', { selectedQuiz: undefined });
    } else {
      const timeLeft = Math.max(0, timeUntilDrop);
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      
      Alert.alert(
        'Quiz Not Available Yet', 
        `The next quiz will be available in ${hours}h ${minutes}m. Check back soon!`,
        [
          { text: 'OK' },
          { text: 'Refresh', onPress: refresh }
        ]
      );
    }
  };

  const handleRetry = () => {
    refresh();
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="heading1" align="center" style={[styles.appTitle, {color: theme.colors.primary}]}>
            ✨ Eras Quiz ✨
          </Text>
          <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
            It's Era Time! Daily drops await...
          </Text>
        </View>

        {/* Main Drop Card */}
        <Card style={[styles.dropCard, {backgroundColor: theme.colors.card, borderColor: theme.colors.primary}]}>
          <View style={styles.dropContent}>
            <Text variant="heading2" align="center" style={[styles.dropTitle, {color: theme.colors.primary}]}>
              🌙 Tonight's Drop
            </Text>
            
            {/* Status Display */}
            <View style={styles.countdownContainer}>
              {isLoading ? (
                <Text variant="body" align="center" style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
                  Loading quiz status...
                </Text>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text variant="body" align="center" style={[styles.errorText, {color: theme.colors.error}]}>
                    {error}
                  </Text>
                  <Button
                    title="Retry"
                    variant="outline"
                    onPress={handleRetry}
                    style={styles.retryButton}
                  />
                </View>
              ) : isAvailable ? (
                <View style={styles.availableContainer}>
                  {hasAttempt && attemptCompleted ? (
                    <>
                      <Text variant="heading3" align="center" style={[styles.availableText, {color: theme.colors.success}]}>
                        ✅ Quiz Completed!
                      </Text>
                      <Text variant="body" align="center" style={[styles.availableSubtext, {color: theme.colors.text}]}>
                        Score: {status?.attempt?.score || 0}%
                      </Text>
                      <Text variant="caption" align="center" style={[styles.availableSubtext, {color: theme.colors.textSecondary}]}>
                        Come back tomorrow for a new quiz!
                      </Text>
                    </>
                  ) : hasAttempt && !attemptCompleted ? (
                    <>
                      <Text variant="heading3" align="center" style={[styles.availableText, {color: theme.colors.primary}]}>
                        📝 Quiz In Progress
                      </Text>
                      <Text variant="body" align="center" style={[styles.availableSubtext, {color: theme.colors.textSecondary}]}>
                        You can continue your quiz
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text variant="heading3" align="center" style={[styles.availableText, {color: theme.colors.success}]}>
                        🎉 Quiz is Live!
                      </Text>
                      <Text variant="body" align="center" style={[styles.availableSubtext, {color: theme.colors.textSecondary}]}>
                        You have 1 hour to complete today's quiz
                      </Text>
                    </>
                  )}
                </View>
              ) : (
                <>
                  <Text variant="caption" align="center" style={[styles.countdownLabel, {color: theme.colors.textSecondary}]}>
                    {status?.nextDrop?.isToday ? 'Next drop today' : 'Next drop tomorrow'} • Random time between 5-8 PM Toronto
                  </Text>
                  
                  <View style={styles.timeContainer}>
                    <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent1}]}>
                      <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                        {Math.floor(localTimeLeft / 3600).toString().padStart(2, '0')}
                      </Text>
                      <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                        HOURS
                      </Text>
                    </View>
                    
                    <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
                    
                    <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent2}]}>
                      <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                        {Math.floor((localTimeLeft % 3600) / 60).toString().padStart(2, '0')}
                      </Text>
                      <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                        MINUTES
                      </Text>
                    </View>
                    
                    <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
                    
                    <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent3}]}>
                      <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                        {(localTimeLeft % 60).toString().padStart(2, '0')}
                      </Text>
                      <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                        SECONDS
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Quiz action button */}
            {isAvailable && (
              <Button
                title={
                  hasAttempt && attemptCompleted 
                    ? "✅ Quiz Completed" 
                    : hasAttempt && !attemptCompleted 
                      ? "📝 Continue Quiz" 
                      : "🚀 Start Today's Quiz"
                }
                onPress={handleStartQuiz}
                style={[
                  styles.startQuizButton, 
                  {backgroundColor: hasAttempt && attemptCompleted ? theme.colors.textSecondary : theme.colors.success}
                ]}
                disabled={hasAttempt && attemptCompleted}
              />
            )}
          </View>
        </Card>







        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  appTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  dropCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderRadius: 20,
  },
  dropContent: {
    padding: 24,
  },
  dropTitle: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  countdownContainer: {
    marginBottom: 24,
  },
  countdownLabel: {
    marginBottom: 16,
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  timeBlock: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  timeNumber: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
  separator: {
    fontWeight: 'bold',
    fontSize: 24,
    marginHorizontal: 4,
  },
  bottomPadding: {
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  availableContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  availableText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  availableSubtext: {
    fontSize: 16,
  },
  startQuizButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
  completedContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedTitle: {
    marginBottom: 4,
  },
  completedText: {
    marginBottom: 2,
    textAlign: 'center',
  },
  statusCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
  },
  checkingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});