import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import type {RootStackScreenProps} from '../../../navigation/types';
import { QuestionRenderer } from '../components/questions/QuestionRenderer';
import { AnswerHandler, QuestionAnswer } from '../utils/AnswerHandler';
import { AnyQuestion } from '../../../shared/interfaces/questions/any-question.type';
import { basicQuizMock } from '../constants/quizMocks';

type Props = RootStackScreenProps<'Quiz'>;

export default function QuizScreen({navigation, route}: Props) {
  const theme = useTheme();
  
  // Get the selected quiz from navigation params, fallback to basic quiz
  const selectedQuiz = route.params?.selectedQuiz || basicQuizMock;
  const mockQuestions = selectedQuiz.questions;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuestionAnswer | null>(() => 
    AnswerHandler.getDefaultAnswer(mockQuestions[0])
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<{[key: string]: QuestionAnswer}>({});
  const [timeRemaining, setTimeRemaining] = useState(selectedQuiz.estimatedTime * 60); // Convert minutes to seconds
  const [hintsUsed, setHintsUsed] = useState<{[key: string]: boolean}>({});
  const [showHint, setShowHint] = useState(false);
  const [retriesUsed, setRetriesUsed] = useState(0);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1;
  const isAnswered = answeredQuestions[currentQuestion.id] !== undefined;

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up!
          Alert.alert(
            'Time\'s Up! ⏰',
            'Your quiz time has expired. Let\'s see your results!',
            [{text: 'View Results', onPress: () => navigation.navigate('Results')}]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: QuestionAnswer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !AnswerHandler.isAnswerComplete(currentQuestion, selectedAnswer)) return;

    setAnsweredQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }));

    // Move to next question or finish
    if (isLastQuestion) {
      Alert.alert(
        'Quiz Complete! 🎉',
        'You\'ve answered all questions! Let\'s see how you did.',
        [{text: 'View Results', onPress: () => navigation.navigate('Results')}]
      );
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(AnswerHandler.getDefaultAnswer(mockQuestions[currentQuestionIndex + 1]));
        setShowHint(false);
      }, 500);
    }
  };

  const handleHint = () => {
    if (hintsUsed[currentQuestion.id]) return;
    
    setHintsUsed(prev => ({...prev, [currentQuestion.id]: true}));
    setShowHint(true);
  };

  const handleRetry = () => {
    if (retriesUsed >= 1) return; // Only 1 retry allowed
    
    setRetriesUsed(prev => prev + 1);
    setSelectedAnswer(AnswerHandler.getDefaultAnswer(currentQuestion));
    // Remove the current answer to allow retry
    setAnsweredQuestions(prev => {
      const newAnswers = {...prev};
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
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
              disabled={isAnswered}
              showCorrect={isAnswered}
              correctAnswer={currentQuestion.correct}
              showHint={showHint}
              onAutoSubmit={handleSubmitAnswer}
            />
            
            {/* Hint display - keeping the original hint system for now */}
            {showHint && (currentQuestion as any).hintText && (
              <View style={[styles.hintContainer, {backgroundColor: theme.colors.surface || theme.colors.card}]}>
                <Text variant="caption" style={[styles.hintLabel, {color: theme.colors.primary}]}>
                  💡 HINT:
                </Text>
                <Text variant="body" style={[styles.hintText, {color: theme.colors.text}]}>
                  {(currentQuestion as any).hintText}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {!isAnswered ? (
            <>
              <Button
                title="Submit Answer"
                onPress={handleSubmitAnswer}
                style={[styles.submitButton, {backgroundColor: theme.colors.primary}]}
              />
              
              <View style={styles.powerupButtons}>
                <Button
                  title={`💡 Hint ${hintsUsed[currentQuestion.id] ? '(Used)' : '(3 left)'}`}
                  onPress={handleHint}
                  variant="outline"
                  style={styles.powerupButton}
                  disabled={hintsUsed[currentQuestion.id]}
                />
                
                <Button
                  title={`🔄 Retry ${retriesUsed >= 1 ? '(Used)' : '(1 left)'}`}
                  onPress={handleRetry}
                  variant="outline"
                  style={styles.powerupButton}
                  disabled={retriesUsed >= 1}
                />
              </View>
            </>
          ) : (
            <Button
              title={isLastQuestion ? "🏆 Finish Quiz" : "➡️ Next Question"}
              onPress={handleSubmitAnswer}
              style={[styles.submitButton, {backgroundColor: theme.colors.success}]}
            />
          )}
        </View>

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