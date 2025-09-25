import React from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {useQuizCountdown, useQuizAvailability, useDailyQuizErrorHandler} from '../hooks/useDailyQuiz';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'DailyDrop'>;

export default function DailyDropScreen({navigation}: Props) {
  const theme = useTheme();
  const { 
    timeLeft, 
    isLoading: countdownLoading, 
    error: countdownError, 
    dropData,
    isToday,
    hasDropped,
    refetch: refetchCountdown 
  } = useQuizCountdown();
  
  const { 
    canStart, 
    reason, 
    isChecking, 
    recheck 
  } = useQuizAvailability();
  
  const { getErrorMessage, shouldShowRetry } = useDailyQuizErrorHandler();

  const handleStartQuiz = async () => {
    if (canStart) {
      navigation.navigate('StartQuiz');
    } else {
      Alert.alert(
        'Quiz Not Available', 
        reason || 'Cannot start quiz right now',
        [
          { text: 'OK' },
          ...(shouldShowRetry ? [{ text: 'Retry', onPress: recheck }] : [])
        ]
      );
    }
  };



  const handleRetryCountdown = () => {
    refetchCountdown();
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
            
            {/* Countdown */}
            <View style={styles.countdownContainer}>
              {countdownLoading ? (
                <Text variant="body" align="center" style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
                  Loading countdown...
                </Text>
              ) : countdownError ? (
                <View style={styles.errorContainer}>
                  <Text variant="body" align="center" style={[styles.errorText, {color: theme.colors.error}]}>
                    {countdownError}
                  </Text>
                  <Button
                    title="Retry"
                    variant="outline"
                    onPress={handleRetryCountdown}
                    style={styles.retryButton}
                  />
                </View>
              ) : hasDropped && canStart ? (
                <View style={styles.availableContainer}>
                  <Text variant="heading3" align="center" style={[styles.availableText, {color: theme.colors.success}]}>
                    🎉 Quiz is Live!
                  </Text>
                  <Text variant="body" align="center" style={[styles.availableSubtext, {color: theme.colors.textSecondary}]}>
                    You have 1 hour to complete today's quiz
                  </Text>
                </View>
              ) : (
                <>
                  <Text variant="caption" align="center" style={[styles.countdownLabel, {color: theme.colors.textSecondary}]}>
                    {isToday ? 'Next drop today' : 'Next drop tomorrow'} • Random time between 5-8 PM Toronto
                  </Text>
                  
                  <View style={styles.timeContainer}>
                    <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent1}]}>
                      <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </Text>
                      <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                        HOURS
                      </Text>
                    </View>
                    
                    <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
                    
                    <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent2}]}>
                      <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </Text>
                      <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                        MINUTES
                      </Text>
                    </View>
                    
                    <Text variant="heading1" style={[styles.separator, {color: theme.colors.primary}]}>:</Text>
                    
                    <View style={[styles.timeBlock, {backgroundColor: theme.colors.accent3}]}>
                      <Text variant="heading1" style={[styles.timeNumber, {color: theme.colors.textOnPrimary}]}>
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </Text>
                      <Text variant="caption" style={[styles.timeLabel, {color: theme.colors.textOnPrimary}]}>
                        SECONDS
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Quiz action */}
            {hasDropped && canStart && (
              <Button
                title="🚀 Start Today's Quiz"
                onPress={handleStartQuiz}
                style={[styles.startQuizButton, {backgroundColor: theme.colors.success}]}
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