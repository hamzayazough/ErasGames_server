import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView, StatusBar, Alert} from 'react-native';
import {View, Text, Button, Card} from '../../../ui';
import {useTheme} from '../../../core/theme/ThemeProvider';
import type {RootStackScreenProps} from '../../../navigation/types';

type Props = RootStackScreenProps<'Quiz'>;

interface Question {
  id: string;
  type: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hintText?: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'album_year_guess',
    question: 'What year was the album "folklore" released?',
    choices: ['2019', '2020', '2021', '2022'],
    correctAnswer: 1,
    difficulty: 'easy',
    hintText: 'It was released during the pandemic year'
  },
  {
    id: '2',
    type: 'song_lyrics',
    question: 'Complete the lyric: "I\'ve got a blank space baby, and I\'ll..."',
    choices: ['write your name', 'sing your song', 'dance all night', 'call you mine'],
    correctAnswer: 0,
    difficulty: 'easy',
    hintText: 'This is from one of her biggest pop hits'
  },
  {
    id: '3',
    type: 'album_match',
    question: 'Which album features the song "cardigan"?',
    choices: ['Lover', 'folklore', 'evermore', '1989'],
    correctAnswer: 1,
    difficulty: 'medium',
    hintText: 'It\'s from her indie-folk era'
  },
  {
    id: '4',
    type: 'era_trivia',
    question: 'What color was prominently associated with the "Lover" era?',
    choices: ['Red', 'Purple', 'Pink', 'Gold'],
    correctAnswer: 2,
    difficulty: 'medium',
    hintText: 'Think about the album\'s overall aesthetic and mood'
  },
  {
    id: '5',
    type: 'deep_cut',
    question: 'In "All Too Well (10 Minute Version)", what item of clothing is mentioned?',
    choices: ['Red scarf', 'Blue dress', 'Black hat', 'White shirt'],
    correctAnswer: 0,
    difficulty: 'easy',
    hintText: 'It\'s a key symbol in the song that represents lost love'
  },
  {
    id: '6',
    type: 'timeline',
    question: 'Which of these albums was released FIRST?',
    choices: ['Red', 'Speak Now', 'Fearless', '1989'],
    correctAnswer: 2,
    difficulty: 'hard',
    hintText: 'Think about her early career chronology'
  }
];

export default function QuizScreen({navigation}: Props) {
  const theme = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<{[key: string]: number}>({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
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

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

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
        setSelectedAnswer(null);
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
    setSelectedAnswer(null);
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

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = isAnswered && index === currentQuestion.correctAnswer;
    const isWrong = isAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer;

    if (isCorrect) {
      return [styles.choice, {backgroundColor: theme.colors.success, borderColor: theme.colors.success}];
    } else if (isWrong) {
      return [styles.choice, {backgroundColor: theme.colors.error, borderColor: theme.colors.error}];
    } else if (isSelected) {
      return [styles.choice, styles.selectedChoice, {backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary}];
    } else {
      return [styles.choice, {backgroundColor: theme.colors.card, borderColor: theme.colors.border}];
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header with timer and progress */}
      <View style={[styles.header, {backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border}]}>
        <View style={styles.headerTop}>
          <View style={styles.progressContainer}>
            <Text variant="caption" style={[styles.progressText, {color: theme.colors.textSecondary}]}>
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </Text>
            <View style={[styles.progressBar, {backgroundColor: theme.colors.surface}]}>
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
          
          <View style={[styles.timerContainer, {backgroundColor: theme.colors.red}]}>
            <Text variant="body" style={[styles.timerText, {color: theme.colors.textOnPrimary}]}>
              ⏱️ {formatTime(timeRemaining)}
            </Text>
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
            
            {/* Question text */}
            <Text variant="heading3" style={[styles.questionText, {color: theme.colors.text}]}>
              {currentQuestion.question}
            </Text>
            
            {/* Hint display */}
            {showHint && currentQuestion.hintText && (
              <View style={[styles.hintContainer, {backgroundColor: theme.colors.surface}]}>
                <Text variant="caption" style={[styles.hintLabel, {color: theme.colors.primary}]}>
                  💡 HINT:
                </Text>
                <Text variant="body" style={[styles.hintText, {color: theme.colors.text}]}>
                  {currentQuestion.hintText}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Answer Choices */}
        <View style={styles.choicesContainer}>
          {currentQuestion.choices.map((choice, index) => (
            <Button
              key={index}
              title={choice}
              onPress={() => !isAnswered && handleAnswerSelect(index)}
              style={getChoiceStyle(index)}
              disabled={isAnswered}
            />
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {!isAnswered ? (
            <>
              <Button
                title="Submit Answer"
                onPress={handleSubmitAnswer}
                disabled={selectedAnswer === null}
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
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
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
  questionText: {
    fontWeight: '600',
    lineHeight: 28,
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
  choicesContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  choice: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  selectedChoice: {
    borderWidth: 2,
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