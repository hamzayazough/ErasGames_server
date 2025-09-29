import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator, Dimensions, Animated} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme, RetroBackground} from '../../../core/theme';
import GlobalHeader from '../../../shared/components/GlobalHeader';
import type {RootStackScreenProps} from '../../../navigation/types';
import { QuestionRenderer } from '../components/questions/QuestionRenderer';
import { AnswerHandler, QuestionAnswer } from '../utils/AnswerHandler';
import { AnyQuestion } from '../../../shared/interfaces/questions/any-question.type';
import { basicQuizMock } from '../constants/quizMocks';
import { 
  QuizAttemptService, 
  QuizAttempt, 
  QuizSubmission 
} from '../../../core/services/quiz-attempt.service';
import { DailyQuizService, QuizTemplate } from '../../../core/api/daily-quiz';

type Props = RootStackScreenProps<'Quiz'>;

export default function QuizScreen({navigation, route}: Props) {
  const theme = useTheme();
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswer | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<{[key: string]: QuestionAnswer}>({});
  const [timeRemaining, setTimeRemaining] = useState(1 * 60); // 1 minute = 60 seconds
  const [quizStarted, setQuizStarted] = useState(!!route.params?.quizAttempt); // Start immediately if quiz data is passed
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(route.params?.quizAttempt || null);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmission | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [quizTemplate, setQuizTemplate] = useState<QuizTemplate | null>(route.params?.quizTemplate || null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const isMountedRef = useRef(true);

  // Get selected quiz for metadata (title, description, etc.)
  const selectedQuiz = route.params?.selectedQuiz || {
    id: 'daily-quiz',
    title: "Today's Daily Quiz",
    description: '6 questions (3 easy, 2 medium, 1 hard) • 1 minute time limit',
    difficulty: 'mixed' as const,
    estimatedTime: 1,
    questions: []
  };
  
  // Use real quiz template if available, fallback to mock for development
  const questions = quizTemplate?.questions || selectedQuiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Set default answer when questions change
  useEffect(() => {
    if (currentQuestion && !selectedAnswer) {
      setSelectedAnswer(AnswerHandler.getDefaultAnswer(currentQuestion));
    }
  }, [currentQuestion, selectedAnswer]);

  // Initialize quiz when data is passed via navigation
  useEffect(() => {
    if (route.params?.quizAttempt && route.params?.quizTemplate) {
      const attempt = route.params.quizAttempt;
      const template = route.params.quizTemplate;
      
      setQuizAttempt(attempt);
      setQuizTemplate(template);
      setTimeRemaining(QuizAttemptService.getTimeRemaining(attempt.deadline));
      setQuizStarted(true);
      setQuestionStartTime(Date.now());
    }
  }, [route.params?.quizAttempt, route.params?.quizTemplate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Timer countdown - calculates remaining time from deadline
  useEffect(() => {
    if (!quizStarted || !quizAttempt || quizSubmitted) return;
    
    const interval = setInterval(() => {
      try {
        const remaining = QuizAttemptService.getTimeRemaining(quizAttempt.deadline);
        setTimeRemaining(remaining);
        
        if (remaining === 0 && isMountedRef.current && !quizSubmitted) {
          // Time's up! Auto-submit quiz immediately
          setTimeout(() => {
            if (isMountedRef.current && !quizSubmitted) {
              handleQuizSubmit();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error updating quiz timer:', error);
        // Fallback to local countdown
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, quizAttempt, quizSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: QuestionAnswer) => {
    setSelectedAnswer(answer);
  };

  // Submit answer for current question when moving to next
  const submitCurrentAnswer = async () => {
    if (!quizAttempt || !selectedAnswer) return;
    
    const timeSpent = Date.now() - questionStartTime;
    
    try {
      await QuizAttemptService.submitAnswer(
        quizAttempt.attemptId,
        currentQuestion.id,
        selectedAnswer,
        timeSpent
      );
    } catch (error) {
      console.error('❌ Failed to submit answer for question:', currentQuestion.id, error);
      // Continue anyway - we'll retry at the end
    }
  };

  const handleStartQuiz = async () => {
    try {
      setIsStartingQuiz(true);
      
      // First check if user already has an attempt for today
      const attemptStatus = await QuizAttemptService.getTodayAttemptStatus();
      
      if (attemptStatus.hasAttempt) {
        if (attemptStatus.attempt?.status === 'finished') {
          // Show completed quiz message
          Alert.alert(
            'Quiz Already Completed',
            `You've already completed today's quiz with a score of ${attemptStatus.attempt.score || 0}%! Come back tomorrow for a new quiz.`,
            [{text: 'OK'}]
          );
        } else {
          // Show active attempt message
          Alert.alert(
            'Quiz In Progress',
            'You have an active quiz attempt. Please finish it first or wait for it to expire.',
            [{text: 'OK'}]
          );
        }
        return;
      }
      
      // Start quiz attempt on server
      const attempt = await QuizAttemptService.startAttempt();
      
      // Fetch the quiz template from CDN
      const templateResponse = await fetch(attempt.templateUrl);
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch quiz template: ${templateResponse.status}`);
      }
      const rawTemplate = await templateResponse.json();
      
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
      
      // Store quiz template and attempt data
      setQuizTemplate(transformedTemplate);
      setQuizAttempt(attempt);
      setTimeRemaining(QuizAttemptService.getTimeRemaining(attempt.deadline));
      setQuizStarted(true);
      setQuestionStartTime(Date.now());
      
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

  const handleQuizSubmit = async () => {
    if (!quizAttempt || isSubmittingQuiz) return;
    
    console.log('📝 USER CLICKED SUBMIT QUIZ - Collecting all answers for bulk submission...');
    
    try {
      setIsSubmittingQuiz(true);
      
      // Include current answer if we have one
      const finalAnswers = {...answeredQuestions};
      if (selectedAnswer && currentQuestion) {
        finalAnswers[currentQuestion.id] = selectedAnswer;
      }
      
      // Convert to server format for bulk submission
      const bulkAnswers = Object.entries(finalAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      console.log('📦 Submitting answers in bulk:', bulkAnswers.length, 'answers');
      console.log('🔄 Calling QuizAttemptService.finishAttempt() with bulk answers...');
      
      // Finish the attempt with bulk answer submission and get final score
      const result = await QuizAttemptService.finishAttempt(quizAttempt.attemptId, bulkAnswers);
      
      console.log('✅ QUIZ SUBMISSION SUCCESSFUL!');
      console.log('🎯 Final Score:', result.score);
      console.log('📊 Score Breakdown:', result.breakdown);
      console.log('⏱️ Finish Time:', result.finishTimeSec, 'seconds');
      console.log('🎯 Accuracy Points:', result.accPoints);
      
      setQuizResult(result);
      setQuizSubmitted(true); // Stop the timer
      
      if (isMountedRef.current) {
        // Create QuizSubmission object for results screen
        const quizSubmission = {
          finalScore: result.score,
          scoreBreakdown: result.breakdown,
          finishTimeSeconds: result.finishTimeSec,
          accuracyPoints: result.accPoints,
          questions: result.questions
        };
        
        // Navigate to results screen
        navigation.navigate('QuizResults', {
          quizResult: quizSubmission
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert(
        'Submission Error',
        'Failed to submit your quiz. Please try again.',
        [
          {text: 'Retry', onPress: handleQuizSubmit},
          {text: 'Cancel', onPress: () => navigation.goBack()}
        ]
      );
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    // Save the current answer locally (no individual server submission)
    console.log('💾 Saving answer locally for question:', currentQuestion.id);
    setAnsweredQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }));

    // Move to next question or finish
    if (isLastQuestion) {
      handleQuizSubmit();
    } else {
      // Move to next question immediately
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(AnswerHandler.getDefaultAnswer(questions[currentQuestionIndex + 1]));
      setQuestionStartTime(Date.now()); // Reset timer for new question
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <RetroBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Global Header */}
      <GlobalHeader 
        showBack={true}
        showProfile={true}
        showLeaderboard={true}
      />
      
      {!quizStarted ? (
        // Enhanced Quiz Start Screen with Retro Styling
        <View style={styles.startScreen}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={[styles.gameLogoContainer, {backgroundColor: 'transparent'}]}>
              <Text style={[styles.gameTitle, {color: theme.colors.primary}]}>
                DAILY QUIZ
              </Text>
              <View style={[styles.titleUnderline, {backgroundColor: theme.colors.accent1}]} />
            </View>
            
            <Text style={[styles.heroSubtitle, {color: theme.colors.textSecondary}]}>
              Test your knowledge against the clock!
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, {backgroundColor: theme.colors.primary}]}>
              <Text style={[styles.statNumber, {color: theme.colors.textOnPrimary}]}>
                6
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.textOnPrimary}]}>
                QUESTIONS
              </Text>
            </View>
            
            <View style={[styles.statCard, {backgroundColor: theme.colors.accent1}]}>
              <Text style={[styles.statNumber, {color: theme.colors.accent4}]}>
                1:00
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.accent4}]}>
                TIMER
              </Text>
            </View>
            
            <View style={[styles.statCard, {backgroundColor: theme.colors.accent4}]}>
              <Text style={[styles.statNumber, {color: theme.colors.accent1}]}>
                MIX
              </Text>
              <Text style={[styles.statLabel, {color: theme.colors.accent1}]}>
                DIFFICULTY
              </Text>
            </View>
          </View>

          {/* Instructions Card */}
          <View style={[styles.instructionsCard, {backgroundColor: 'rgba(244, 229, 177, 0.15)', borderColor: theme.colors.accent1}]}>
            <View style={styles.warningHeader}>
              <Text style={[styles.warningIcon, {color: theme.colors.primary}]}>⚠️</Text>
              <Text style={[styles.warningTitle, {color: theme.colors.accent1}]}>IMPORTANT</Text>
            </View>
            <Text style={[styles.warningText, {color: theme.colors.textSecondary}]}>
              Once you start, the timer begins immediately. You cannot pause or restart the quiz. Make sure you're ready!
            </Text>
          </View>

          {/* Start Button */}
          <View style={styles.startButtonContainer}>
            <Button
              title={isStartingQuiz ? "STARTING..." : "🚀 START QUIZ"}
              onPress={handleStartQuiz}
              disabled={isStartingQuiz}
              style={[styles.retroStartButton, {backgroundColor: theme.colors.primary}]}
            />
            
            {isStartingQuiz && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.accent1} />
                <Text style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
                  Preparing your quiz...
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <>
        {/* Enhanced Quiz Header */}
        <View style={[styles.quizHeader, {backgroundColor: 'rgba(244, 229, 177, 0.1)', borderBottomColor: theme.colors.accent1}]}>
          <View style={styles.quizHeaderTop}>
            {/* Timer with enhanced styling - centered */}
            <View style={[styles.enhancedTimer, {backgroundColor: theme.colors.primary}]}>
              <Text style={[styles.timerLabel, {color: theme.colors.textOnPrimary}]}>
                TIME
              </Text>
              <Text style={[styles.timerValue, {color: theme.colors.textOnPrimary}]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
          </View>
        </View>
      
        <ScrollView style={styles.quizScrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Question Card */}
          <View style={[styles.enhancedQuestionCard, {backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: theme.colors.accent1}]}>
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <View style={[styles.enhancedDifficultyBadge, {backgroundColor: getDifficultyColor(currentQuestion.difficulty)}]}>
                <Text style={[styles.difficultyBadgeText, {color: theme.colors.textOnPrimary}]}>
                  {currentQuestion.difficulty.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.questionTypeContainer}>
                <Text style={[styles.questionTypeValue, {color: theme.colors.accent4}]}>
                  {currentQuestion.questionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            </View>
            
            {/* Question Content */}
            <View style={styles.questionContentSection}>
              <QuestionRenderer
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onAnswerChange={handleAnswerChange}
                disabled={false}
                showCorrect={false}
                correctAnswer={undefined}
                showHint={false}
                onAutoSubmit={handleSubmitAnswer}
              />
            </View>
          </View>

          {/* Enhanced Action Button */}
          <View style={styles.actionSection}>
            <Button
              title={
                isSubmittingQuiz 
                  ? "SUBMITTING..." 
                  : isLastQuestion 
                  ? "SUBMIT QUIZ" 
                  : "NEXT QUESTION"
              }
              onPress={handleSubmitAnswer}
              disabled={isSubmittingQuiz}
              style={[styles.enhancedActionButton, {backgroundColor: theme.colors.primary}]}
            />
            
            {isSubmittingQuiz && (
              <View style={styles.submittingContainer}>
                <ActivityIndicator size="large" color={theme.colors.accent1} />
                <Text style={[styles.submittingText, {color: theme.colors.textSecondary}]}>
                  Processing your answers...
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
        </>
      )}
    </RetroBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // START SCREEN STYLES
  startScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  gameLogoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 120,
    height: 4,
    marginTop: 8,
    borderRadius: 2,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  
  // STATS GRID
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  // INSTRUCTIONS CARD
  instructionsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginVertical: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // START BUTTON
  startButtonContainer: {
    alignItems: 'center',
    gap: 16,
  },
  retroStartButton: {
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    minWidth: 280,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // QUIZ SCREEN STYLES
  quizHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
  },
  quizHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizInfoSection: {
    flex: 1,
  },
  quizTitleText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  questionProgress: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // ENHANCED TIMER
  enhancedTimer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 80,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  
  // PROGRESS SECTION
  progressSection: {
    alignItems: 'center',
    gap: 8,
  },
  enhancedProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  enhancedProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // QUIZ CONTENT
  quizScrollView: {
    flex: 1,
  },
  enhancedQuestionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // QUESTION HEADER
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 229, 177, 0.3)',
  },
  enhancedDifficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  questionTypeContainer: {
    alignItems: 'flex-end',
  },
  questionTypeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  questionTypeValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // THEMES SECTION
  themesSection: {
    marginBottom: 24,
  },
  themesLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  enhancedThemeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enhancedThemeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // QUESTION CONTENT
  questionContentSection: {
    marginTop: 8,
  },
  
  // ACTION SECTION
  actionSection: {
    marginHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
  },
  enhancedActionButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 280,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  submittingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  submittingText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  bottomSpacer: {
    height: 40,
  },
});