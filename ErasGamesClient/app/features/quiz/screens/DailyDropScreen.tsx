import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {View} from '../../../ui/View';
import {Text} from '../../../ui/Text';
import {Button} from '../../../ui/Button';
import {useTheme, RetroBackground} from '../../../core/theme';
import {RootStackScreenProps} from '../../../navigation/types';
import {useDailyQuizStatus, useDailyQuizErrorHandler} from '../hooks/useDailyQuiz';
import { 
  QuizAttemptService, 
  QuizAttempt, 
  QuizSubmission 
} from '../../../core/services/quiz-attempt.service';
import { DailyQuizService, QuizTemplate } from '../../../core/api/daily-quiz';
import {QuizAvailableState, QuizCompletedState} from '../components';
import {GlobalHeader} from '../../../shared/components';

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const timeComponents = formatTime(localTimeLeft);



  if (isLoading) {
    return (
      <RetroBackground style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textOnBackground }]}>
            Loading...
          </Text>
        </View>
      </RetroBackground>
    );
  }

  if (error) {
    return (
      <RetroBackground style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {getErrorMessage(error)}
          </Text>
          {shouldShowRetry(error) && (
            <Button
              title="Retry"
              onPress={refresh}
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            />
          )}
        </View>
      </RetroBackground>
    );
  }

  return (
    <RetroBackground style={styles.container}>
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
            source={require('../../../assets/images/erasgames-title.png')}
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
            />
          ) : (
            <QuizAvailableState
              hasAttempt={hasAttempt}
              attemptCompleted={attemptCompleted}
              quizWindowTimeLeft={quizWindowTimeLeft}
              isStartingQuiz={isStartingQuiz}
              onStartQuiz={handleStartQuiz}
            />
          )
        ) : (
          <>
            {/* Next Quiz Label */}
            <Text style={[styles.nextQuizLabel, { color: theme.colors.textSecondary }]}>
              NEXT QUIZ IN
            </Text>

            {/* Countdown Timer - Large numbers matching the design */}
            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownTime, { color: theme.colors.textSecondary }]}>
                {timeComponents.hours}:{timeComponents.minutes}:{timeComponents.seconds}
              </Text>
            </View>
          </>
        )}

        {/* How to Play - Bottom text */}
        <TouchableOpacity onPress={handleHowToPlay} activeOpacity={0.7} style={styles.howToPlayContainer}>
          <Text style={[styles.howToPlayText, { color: theme.colors.textSecondary }]}>
            How do you play?
          </Text>
        </TouchableOpacity>
      </View>
    </RetroBackground>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: screenWidth * 0.8, // 80% of screen width
    height: screenHeight * 0.25, // 25% of screen height
    maxWidth: 400,
    maxHeight: 200,
  },
  nextQuizLabel: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  countdownContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  countdownTime: {
    fontSize: 52,
    fontWeight: '900', // Maximum bold weight
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 85,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
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
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});