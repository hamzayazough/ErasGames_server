import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {View} from '../../../ui/View';
import {Text} from '../../../ui/Text';
import {Button} from '../../../ui/Button';
import {Card} from '../../../ui/Card';
import {useTheme, ThemedBackground} from '../../../core/theme';
import {RootStackScreenProps} from '../../../navigation/types';
import {useDailyQuizStatus, useDailyQuizErrorHandler} from '../hooks/useDailyQuiz';
import { 
  QuizAttemptService, 
  QuizAttempt, 
  QuizSubmission 
} from '../../../core/services/quiz-attempt.service';
import { DailyQuizService, QuizTemplate } from '../../../core/api/daily-quiz';
import {QuizAvailableState, QuizCompletedState} from '../components';
import {GlobalHeader, AnimatedLogo, ThemeSwitcher, CountdownTimer} from '../../../shared/components';
import { FONTS } from '../../../core/config/fonts';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

type Props = RootStackScreenProps<'DailyDrop'>;

export default function DailyDropScreen({navigation}: Props) {
  const theme = useTheme();
  
  // Use the consolidated hook that handles everything
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
  
  // Next day countdown state (when quiz is completed)
  const [nextDayTimeLeft, setNextDayTimeLeft] = useState(0);
  const [nextDayTotalTime, setNextDayTotalTime] = useState(86400); // Default to 24 hours
  
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

  // Calculate time until quiz window ends when current quiz is completed
  useEffect(() => {
    if (hasAttempt && attemptCompleted && status?.quiz?.window?.end) {
      // Calculate the total window duration (60 minutes = 3600 seconds)
      const windowStartTime = new Date(status.quiz.window.start);
      const windowEndTime = new Date(status.quiz.window.end);
      const totalWindowDuration = Math.floor((windowEndTime.getTime() - windowStartTime.getTime()) / 1000);
      setNextDayTotalTime(totalWindowDuration);
      
      const calculateWindowEndCountdown = () => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.floor((windowEndTime.getTime() - now.getTime()) / 1000));
        
        setNextDayTimeLeft(timeLeft);
      };
      
      // Calculate initial time
      calculateWindowEndCountdown();
      
      // Update every second
      const interval = setInterval(() => {
        calculateWindowEndCountdown();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [hasAttempt, attemptCompleted, status?.quiz?.window?.end]);

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

  const handleHowToPlay = () => {
    // TODO: Navigate to how to play screen or show modal
    Alert.alert('How to Play', 'How to play instructions coming soon!');
  };

  const handleRetry = () => {
    refresh();
  };





  if (isLoading) {
    return (
      <ThemedBackground style={styles.container}>
        <View style={styles.centerContent}>
          <AnimatedLogo size={200} />
        </View>
      </ThemedBackground>
    );
  }

  if (error) {
    return (
      <ThemedBackground style={styles.container}>
        <GlobalHeader 
          title="DAILY DROP"
          showBack={false}
          showProfile={true}
          showLeaderboard={true}
        />
        <View style={styles.centerContent}>
          <Card style={[styles.errorCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.errorContainer}>
              <AnimatedLogo size={120} />
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text variant="heading1" align="center" style={[styles.errorTitle, { color: theme.colors.text }]}>
                Oops!
              </Text>
              <Text variant="heading3" align="center" style={[styles.errorSubtitle, { color: theme.colors.text }]}>
                Something went wrong
              </Text>
              {shouldShowRetry(error) && (
                <Button
                  title="🔄 Try Again"
                  onPress={refresh}
                  style={styles.retryButton}
                  variant="primary"
                />
              )}
            </View>
          </Card>
        </View>
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground style={styles.container}>
      <ThemeSwitcher />
      <GlobalHeader 
        title="DAILY DROP"
        showBack={false}
        onProfilePress={() => {
          // Navigate to profile or handle profile action
          console.log('Profile pressed');
        }}
        onLeaderboardPress={() => {
          // Navigate to leaderboard or handle leaderboard action
          console.log('Leaderboard pressed');
        }}
      />
      <View style={styles.content}>
        {/* Logo Image - ERAS GAMES */}
        <View style={styles.logoContainer}>
          <Image 
            source={theme.assets.titleImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Status Display */}
        {isAvailable ? (
          hasAttempt && attemptCompleted ? (
            <QuizCompletedState
              score={status?.attempt?.score || 0}
              correctAnswers={status?.attempt?.correctAnswers || 0}
              totalQuestions={status?.attempt?.totalQuestions || 6}
              timeTaken={status?.attempt?.timeTaken ? `${status.attempt.timeTaken}s` : undefined}
              nextDayTimeLeft={nextDayTimeLeft}
              nextDayTotalTime={nextDayTotalTime}
              navigation={navigation}
            />
          ) : (
            <QuizAvailableState
              hasAttempt={hasAttempt}
              attemptCompleted={attemptCompleted}
              quizWindowTimeLeft={quizWindowTimeLeft}
              isStartingQuiz={isStartingQuiz}
              onStartQuiz={handleStartQuiz}
              onHowToPlay={handleHowToPlay}
            />
          )
        ) : (
          <CountdownTimer 
            timeLeft={localTimeLeft}
            title="NEXT QUIZ IN"
            showBackground={true}
            size="medium"
            containerStyle={styles.countdownWrapper}
          />
        )}

        {/* How to Play - Bottom text - only show when quiz is not available */}
        {!isAvailable && (
          <TouchableOpacity 
            onPress={handleHowToPlay} 
            activeOpacity={0.8} 
            style={[styles.howToPlayButton, { 
              backgroundColor: theme.colors.accent4,
              borderColor: theme.colors.border 
            }]}
          >
            <Text style={[styles.howToPlayButtonText, { color: theme.colors.text }]}>
              HOW TO PLAY
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: screenWidth * 0.9, // 90% of screen width (increased from 80%)
    height: screenHeight * 0.35, // 35% of screen height (increased from 25%)
    maxWidth: 500, // Increased max width
    maxHeight: 300, // Increased max height
  },
  countdownWrapper: {
    marginBottom: 120,
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
  },
  howToPlayContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  howToPlayText: {
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  howToPlayButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  howToPlayButtonText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Arial Black' : 'sans-serif-black',
    textAlign: 'center',
    letterSpacing: 1,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 16,
  },
  errorCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginTop: 16,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
    minWidth: 160,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
});