import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import type {RootStackScreenProps} from '../../../navigation/types';
import { QuestionRenderer } from '../components/questions/QuestionRenderer';
import { AnswerHandler, QuestionAnswer } from '../utils/AnswerHandler';
import { AnyQuestion } from '../../../shared/interfaces/questions/any-question.type';
import { basicQuizMock, dailyQuizMock } from '../constants/quizMocks';
import { 
  QuizAttemptService, 
  QuizAttempt, 
  QuizStatus, 
  QuizAnswer, 
  QuizSubmission 
} from '../../../core/services/quiz-attempt.service';

type Props = RootStackScreenProps<'Quiz'>;

export default function QuizScreen({navigation, route}: Props) {
  const theme = useTheme();
  
  // Get the selected quiz from navigation params, fallback to daily quiz
  const selectedQuiz = route.params?.selectedQuiz || dailyQuizMock;
  const mockQuestions = selectedQuiz.questions;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswer | null>(() => 
    AnswerHandler.getDefaultAnswer(mockQuestions[0])
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<{[key: string]: QuestionAnswer}>({});
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // Fixed 5 minutes = 300 seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmission | null>(null);
  const isMountedRef = useRef(true);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Timer countdown - syncs with server when quiz is started
  useEffect(() => {
    if (!quizStarted || !quizAttempt) return;
    
    const interval = setInterval(async () => {
      try {
        // Get updated status from server
        const status = await QuizAttemptService.getAttemptStatus(quizAttempt.attemptId);
        setTimeRemaining(status.timeRemaining);
        
        if (status.isTimeUp && isMountedRef.current) {
          // Time's up! Auto-submit quiz safely
          setTimeout(() => {
            if (isMountedRef.current) {
              Alert.alert(
                'Time\'s Up! ⏰',
                'Your 5-minute quiz time has expired. Submitting your answers...',
                [{text: 'OK', onPress: handleQuizSubmit}]
              );
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error updating quiz status:', error);
        // Fallback to local countdown
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, quizAttempt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: QuestionAnswer) => {
    setSelectedAnswer(answer);
  };

  const handleStartQuiz = async () => {
    try {
      setIsStartingQuiz(true);
      
      // Start quiz attempt on server
      const attempt = await QuizAttemptService.startAttempt();
      setQuizAttempt(attempt);
      setTimeRemaining(attempt.timeLimit);
      setQuizStarted(true);
      
      console.log('Quiz attempt started:', attempt.attemptId);
    } catch (error) {
      console.error('Error starting quiz:', error);
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
    
    try {
      setIsSubmittingQuiz(true);
      
      // Collect all answers in the format expected by the server
      const finalAnswers = {
        ...answeredQuestions,
        ...(selectedAnswer ? { [currentQuestion.id]: selectedAnswer } : {})
      };
      
      // Convert to server format (simplified for mock data)
      const serverAnswers: QuizAnswer[] = Object.entries(finalAnswers).map(([questionId, answer], index) => ({
        questionIndex: index,
        selectedAnswer: typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
      }));
      
      console.log('Submitting quiz answers:', serverAnswers);
      
      // Submit to server
      const result = await QuizAttemptService.submitAttempt(quizAttempt.attemptId, serverAnswers);
      setQuizResult(result);
      
      if (isMountedRef.current) {
        Alert.alert(
          'Quiz Submitted! 🎉',
          `Your score: ${result.score}% (${result.correctAnswers}/${result.totalQuestions} correct)`,
          [{text: 'OK', onPress: () => {
            if (isMountedRef.current) {
              navigation.goBack();
            }
          }}]
        );
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

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    // Save the current answer
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
      setSelectedAnswer(AnswerHandler.getDefaultAnswer(mockQuestions[currentQuestionIndex + 1]));
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
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {!quizStarted ? (
        // Quiz Start Screen
        <View style={styles.startScreen}>
          <Card style={[styles.startCard, {backgroundColor: theme.colors.card}]}>
            <Text variant="heading2" style={[styles.startTitle, {color: theme.colors.text}]}>
              📅 Today's Quiz
            </Text>
            
            <View style={styles.quizDetails}>
              <Text variant="body" style={[styles.quizDescription, {color: theme.colors.textSecondary}]}>
                {selectedQuiz.description}
              </Text>
              
              <View style={styles.quizStats}>
                <View style={styles.statItem}>
                  <Text variant="heading3" style={[styles.statNumber, {color: theme.colors.primary}]}>
                    6
                  </Text>
                  <Text variant="caption" style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Questions
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text variant="heading3" style={[styles.statNumber, {color: theme.colors.primary}]}>
                    5:00
                  </Text>
                  <Text variant="caption" style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Time Limit
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text variant="heading3" style={[styles.statNumber, {color: theme.colors.primary}]}>
                    {selectedQuiz.difficulty}
                  </Text>
                  <Text variant="caption" style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
                    Difficulty
                  </Text>
                </View>
              </View>
              
              <Text variant="body" style={[styles.startInstructions, {color: theme.colors.text}]}>
                ⚠️ Once you start, the 5-minute timer will begin. You cannot pause or restart the quiz.
              </Text>
            </View>
            
            <Button
              title={isStartingQuiz ? "Starting..." : "🚀 Start Quiz"}
              onPress={handleStartQuiz}
              disabled={isStartingQuiz}
              style={[styles.startButton, {backgroundColor: theme.colors.primary}]}
            />
            
            {isStartingQuiz && (
              <ActivityIndicator 
                size="small" 
                color={theme.colors.primary} 
                style={{marginTop: 8}}
              />
            )}
          </Card>
        </View>
      ) : (
        <>
        {/* Header with timer and progress */}
        <View style={[styles.header, {backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border}]}>
          <View style={styles.headerTop}>
            <View style={styles.quizInfo}>
              <Text variant="caption" style={[styles.quizTitle, {color: theme.colors.primary}]}>
                {selectedQuiz.title}
              </Text>
              <Text variant="caption" style={[styles.progressText, {color: theme.colors.textSecondary}]}>
                Question {currentQuestionIndex + 1} of {mockQuestions.length}
              </Text>
          </View>
          
          <View style={[styles.timerContainer, {backgroundColor: theme.colors.error}]}>
            <Text variant="body" style={[styles.timerText, {color: theme.colors.textOnPrimary}]}>
              ⏱️ {formatTime(timeRemaining)}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, {backgroundColor: theme.colors.surface || theme.colors.card}]}>
            <View 
              style={[
                styles.progressFill, 
                {
                  backgroundColor: theme.colors.primary,
                  width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%`
                }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <Card style={[styles.questionCard, {backgroundColor: theme.colors.card}]}>
          <View style={styles.questionContent}>
            {/* Difficulty badge */}
            <View style={[styles.difficultyBadge, {backgroundColor: getDifficultyColor(currentQuestion.difficulty)}]}>
              <Text variant="caption" style={[styles.difficultyText, {color: theme.colors.textOnPrimary}]}>
                {currentQuestion.difficulty.toUpperCase()}
              </Text>
            </View>
            
            {/* Question metadata */}
            <View style={styles.questionMeta}>
              <View style={styles.metaRow}>
                <Text variant="caption" style={[styles.metaLabel, {color: theme.colors.textSecondary}]}>
                  Type:
                </Text>
                <Text variant="caption" style={[styles.metaValue, {color: theme.colors.text}]}>
                  {currentQuestion.questionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text variant="caption" style={[styles.metaLabel, {color: theme.colors.textSecondary}]}>
                  Themes:
                </Text>
                <View style={styles.themesList}>
                  {currentQuestion.themes.map((questionTheme, index) => (
                    <View key={index} style={[styles.themeTag, {backgroundColor: theme.colors.surface || theme.colors.card}]}>
                      <Text variant="caption" style={[styles.themeText, {color: theme.colors.text}]}>
                        {questionTheme}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Question Renderer - Handles all 19 question types */}
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
        </Card>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={
              isSubmittingQuiz 
                ? "Submitting..." 
                : isLastQuestion 
                ? "🏆 Submit Quiz" 
                : "➡️ Next Question"
            }
            onPress={handleSubmitAnswer}
            disabled={isSubmittingQuiz}
            style={[styles.submitButton, {backgroundColor: theme.colors.primary}]}
          />
          
          {isSubmittingQuiz && (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.primary} 
              style={{marginTop: 8}}
            />
          )}
        </View>
      </ScrollView>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizInfo: {
    flex: 1,
    marginRight: 16,
  },
  quizTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  questionCard: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
  },
  questionContent: {
    padding: 24,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  questionMeta: {
    marginBottom: 20,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 50,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  themesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  themeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  themeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  hintContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 20,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  startCard: {
    padding: 32,
    alignItems: 'center',
    gap: 24,
  },
  startTitle: {
    textAlign: 'center',
    fontWeight: '700',
  },
  quizDetails: {
    width: '100%',
    gap: 20,
  },
  quizDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  quizStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontWeight: '700',
  },
  statLabel: {
    textTransform: 'uppercase',
    fontSize: 11,
  },
  startInstructions: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
  },
  actionButtons: {
    marginHorizontal: 24,
    marginTop: 32,
    gap: 16,
  },
  submitButton: {
    paddingVertical: 16,
  },
  powerupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  powerupButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});