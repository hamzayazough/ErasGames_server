import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert, Animated, ActivityIndicator} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import {useDailyQuizStatus, useDailyQuizErrorHandler} from '../hooks/useDailyQuiz';
import type {RootStackScreenProps} from '../../../navigation/types';
import { 
  QuizAttemptService, 
  QuizAttempt, 
  QuizSubmission 
} from '../../../core/services/quiz-attempt.service';
import { DailyQuizService, QuizTemplate } from '../../../core/api/daily-quiz';

type Props = RootStackScreenProps<'DailyDrop'>;

// Simple Circular Countdown Timer Component
function CircularCountdownTimer({ timeLeft, totalTime, size = 120 }: { timeLeft: number; totalTime: number; size?: number }) {
  const theme = useTheme();
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Color based on time remaining
  const getColor = () => {
    if (timeLeft > 1800) return '#4CAF50'; // > 30 min - green
    if (timeLeft > 600) return '#FF9800'; // > 10 min - orange  
    return '#F44336'; // < 10 min - red
  };
  
  // Calculate progress - how much time is left (1.0 = full, 0.0 = empty)
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const progressPercentage = Math.round(progress * 100);
  
  // Calculate rotation for the progress circle
  const rotation = 360 * progress; // 360 degrees = full circle
  
  return (
    <View style={[styles.circularTimer, { width: size, height: size }]}>
      {/* Background circle (gray) */}
      <View style={[
        styles.circularTimerBg,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 8,
          borderColor: '#E0E0E0',
          backgroundColor: 'transparent',
        }
      ]} />
      
      {/* Progress circle using border technique */}
      <View style={[
        styles.circularTimerProgress,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 8,
          borderColor: 'transparent',
          transform: [{ rotate: '-90deg' }], // Start from top
          // Show progress using border colors
          borderTopColor: rotation >= 0 ? getColor() : 'transparent',
          borderRightColor: rotation >= 90 ? getColor() : 'transparent', 
          borderBottomColor: rotation >= 180 ? getColor() : 'transparent',
          borderLeftColor: rotation >= 270 ? getColor() : 'transparent',
        }
      ]} />
      
      {/* Partial segment for more precise progress */}
      {rotation > 0 && rotation < 360 && (
        <View style={[
          styles.circularTimerPartial,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 8,
            borderColor: 'transparent',
            position: 'absolute',
            transform: [
              { rotate: '-90deg' },
              { rotate: `${Math.floor(rotation / 90) * 90}deg` }
            ],
            borderTopColor: (rotation % 90) > 0 ? getColor() : 'transparent',
          }
        ]} />
      )}
      
      {/* Time display */}
      <View style={styles.circularTimerText}>
        <Text variant="heading2" style={[styles.timerTime, { color: getColor() }]}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
        <Text variant="caption" style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>
          {progressPercentage}% LEFT
        </Text>
      </View>
    </View>
  );
}

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
  
  // Quiz window countdown state (when quiz is live)
  const [quizWindowTimeLeft, setQuizWindowTimeLeft] = useState(0);
  
  // Quiz starting state
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);

  // Initialize local countdown from server data  
  useEffect(() => {
    setLocalTimeLeft(timeUntilDrop);
  }, [timeUntilDrop]);

  // Calculate quiz window time left when quiz is available
  useEffect(() => {
    if (isAvailable && status?.quiz?.window?.end) {
      const now = new Date();
      const endTime = new Date(status.quiz.window.end);
      const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));

      setQuizWindowTimeLeft(timeLeft);
      
      // Update quiz window countdown every second
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(status.quiz.window.end);
        const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        setQuizWindowTimeLeft(timeLeft);
        
        // If window expired, refresh status
        if (timeLeft === 0) {
          clearInterval(interval);
          refresh();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAvailable, status?.quiz?.window?.end, refresh]);

  // Countdown timer for smooth UI updates
  useEffect(() => {
    if (localTimeLeft > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setLocalTimeLeft(prev => {
          const newValue = Math.max(0, prev - 1);
          
          // When countdown reaches 0, trigger a single refresh to check if quiz is now available
          if (newValue === 0 && prev > 0) {
            console.log('⏰ Countdown reached zero - checking if quiz is now available...');
            // Use setTimeout to avoid state update during render
            setTimeout(() => refresh(), 100);
          }
          
          return newValue;
        });
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
  }, [localTimeLeft, refresh]);

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

    if (!isAvailable) {
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
      return;
    }

    // Start the quiz directly - integrate logic from QuizScreen
    console.log('🎯 USER CLICKED START QUIZ - Beginning quiz attempt...');
    
    try {
      setIsStartingQuiz(true);
      
      // First check if user already has an attempt for today
      console.log('🔍 Checking for existing attempt...');
      const attemptStatus = await QuizAttemptService.getTodayAttemptStatus();
      
      if (attemptStatus.hasAttempt) {
        console.log('⚠️ User already has an attempt for today:', attemptStatus.attempt);
        
        if (attemptStatus.attempt?.status === 'finished') {
          // Show completed quiz message
          Alert.alert(
            'Quiz Already Completed',
            `You've already completed today's quiz with a score of ${attemptStatus.attempt.score || 0}%! Come back tomorrow for a new quiz.`,
            [{text: 'OK'}]
          );
        } else {
          // Show active attempt message - continue to quiz screen
          Alert.alert(
            'Quiz In Progress',
            'You have an active quiz attempt. Please finish it first or wait for it to expire.',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Continue', onPress: () => navigation.navigate('Quiz', { selectedQuiz: undefined })}
            ]
          );
        }
        return;
      }
      
      console.log('🔄 Calling QuizAttemptService.startAttempt()...');
      
      // Start quiz attempt on server
      const attempt = await QuizAttemptService.startAttempt();
      
      console.log('✅ Quiz attempt started successfully!');
      console.log('📋 Attempt ID:', attempt.attemptId);
      console.log('⏰ Server Start:', attempt.serverStartAt);
      console.log('⏰ Deadline:', attempt.deadline);
      console.log('🌐 Template URL:', attempt.templateUrl);
      console.log('🎲 Seed:', attempt.seed);
      
      // Fetch the quiz template from CDN
      console.log('📥 Fetching quiz template from CDN...');
      const templateResponse = await fetch(attempt.templateUrl);
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch quiz template: ${templateResponse.status}`);
      }
      const rawTemplate = await templateResponse.json();
      console.log('✅ Quiz template loaded:', rawTemplate.questions.length, 'questions');
      
      // Transform CDN template format to match expected question structure
      const transformedTemplate = {
        ...rawTemplate,
        questions: rawTemplate.questions.map((q: any) => ({
          id: q.qid, // Map qid to id
          questionType: q.type, // Map type to questionType
          difficulty: q.payload.difficulty || 'medium',
          themes: q.payload.themes || [],
          subjects: q.payload.subjects || [], // Add subjects field
          prompt: q.payload.prompt,
          choices: q.payload.choices,
          correct: q.payload.correct, // Include correct answers if available
          mediaRefs: q.payload.mediaRefs, // Include media references if available
          scoringHints: q.payload.scoringHints, // Include scoring hints if available
          // Copy any other payload properties to the root level
          ...q.payload
        }))
      };
      
      console.log('✅ Template transformed for client:', transformedTemplate.questions[0]);
      
      // Navigate to quiz screen with the loaded quiz data
      navigation.navigate('Quiz', { 
        selectedQuiz: {
          id: 'daily-quiz',
          title: "Today's Daily Quiz",
          description: '6 questions (3 easy, 2 medium, 1 hard) • 1 minute time limit',
          difficulty: 'mixed' as const,
          estimatedTime: 1,
          questions: transformedTemplate.questions
        },
        quizAttempt: attempt,
        quizTemplate: transformedTemplate
      });
      
    } catch (error) {
      console.error('❌ QUIZ START FAILED:', error);
      Alert.alert(
        'Error Starting Quiz',
        'Failed to start the quiz. Please check your connection and try again.',
        [{text: 'OK'}]
      );
    } finally {
      setIsStartingQuiz(false);
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
                        Complete the quiz before time runs out!
                      </Text>
                      
                      {/* Circular countdown timer for quiz window */}
                      <View style={styles.quizTimerContainer}>
                        <CircularCountdownTimer 
                          timeLeft={quizWindowTimeLeft}
                          totalTime={3600} // 1 hour = 3600 seconds
                          size={140}
                        />
                      </View>
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
              <>
                <Button
                  title={
                    isStartingQuiz
                      ? "Starting Quiz..."
                      : hasAttempt && attemptCompleted 
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
                  disabled={hasAttempt && attemptCompleted || isStartingQuiz}
                />
                
                {isStartingQuiz && (
                  <ActivityIndicator 
                    size="small" 
                    color={theme.colors.primary} 
                    style={{marginTop: 12}}
                  />
                )}
              </>
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
  // Circular Timer Styles
  quizTimerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  circularTimer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularTimerBg: {
    position: 'absolute',
  },
  circularTimerProgress: {
    position: 'absolute',
  },
  circularTimerPartial: {
    position: 'absolute',
  },
  circularTimerText: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  timerTime: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 2,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});