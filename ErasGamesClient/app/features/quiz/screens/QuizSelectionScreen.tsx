import React from 'react';
import { StyleSheet, ScrollView, StatusBar } from 'react-native';
import { View, Text, Button, Card } from '../../../ui';
import { useTheme } from '../../../core/theme/ThemeProvider';
import type { RootStackScreenProps } from '../../../navigation/types';
import { allQuizMocks, QuizMock } from '../constants/quizMocks';

type Props = RootStackScreenProps<'QuizSelection'>;

export default function QuizSelectionScreen({ navigation }: Props) {
  const theme = useTheme();

  const handleQuizSelect = (quiz: QuizMock) => {
    navigation.navigate('Quiz', { selectedQuiz: quiz });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'hard': return theme.colors.error;
      case 'mixed': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      case 'mixed': return '🌈';
      default: return '⚪';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text variant="h2" style={[styles.headerTitle, { color: theme.colors.text }]}>
          Choose Your Quiz
        </Text>
        <Text variant="body" style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Select a quiz to test different question types and difficulties
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.quizGrid}>
          {allQuizMocks.map((quiz, index) => (
            <Card key={quiz.id} style={[styles.quizCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.quizHeader}>
                <View style={styles.quizTitleRow}>
                  <Text variant="h3" style={[styles.quizTitle, { color: theme.colors.text }]}>
                    {quiz.title}
                  </Text>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) }]}>
                    <Text variant="caption" style={[styles.difficultyText, { color: theme.colors.textOnPrimary }]}>
                      {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text variant="body" style={[styles.quizDescription, { color: theme.colors.textSecondary }]}>
                  {quiz.description}
                </Text>
              </View>

              <View style={styles.quizStats}>
                <View style={styles.statItem}>
                  <Text variant="caption" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Questions
                  </Text>
                  <Text variant="body" style={[styles.statValue, { color: theme.colors.text }]}>
                    {quiz.questions.length}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text variant="caption" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    Est. Time
                  </Text>
                  <Text variant="body" style={[styles.statValue, { color: theme.colors.text }]}>
                    {quiz.estimatedTime} min
                  </Text>
                </View>
              </View>

              {/* Question Types Preview */}
              <View style={styles.questionTypes}>
                <Text variant="caption" style={[styles.questionTypesLabel, { color: theme.colors.textSecondary }]}>
                  Question Types:
                </Text>
                <View style={styles.questionTypesList}>
                  {[...new Set(quiz.questions.map(q => q.questionType))].slice(0, 3).map((type, idx) => (
                    <View key={idx} style={[styles.questionTypeTag, { backgroundColor: theme.colors.surface }]}>
                      <Text variant="caption" style={[styles.questionTypeText, { color: theme.colors.text }]}>
                        {type.replace('-', ' ')}
                      </Text>
                    </View>
                  ))}
                  {[...new Set(quiz.questions.map(q => q.questionType))].length > 3 && (
                    <Text variant="caption" style={[styles.moreTypes, { color: theme.colors.textSecondary }]}>
                      +{[...new Set(quiz.questions.map(q => q.questionType))].length - 3} more
                    </Text>
                  )}
                </View>
              </View>

              <Button
                title="Start Quiz"
                onPress={() => handleQuizSelect(quiz)}
                style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
              />
            </Card>
          ))}
        </View>

        {/* Quick Start Section */}
        <Card style={[styles.quickStartCard, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h3" style={[styles.quickStartTitle, { color: theme.colors.text }]}>
            🚀 Quick Start
          </Text>
          <Text variant="body" style={[styles.quickStartDescription, { color: theme.colors.textSecondary }]}>
            Not sure which quiz to take? Start with the Basic Quiz to get familiar with the question formats.
          </Text>
          <Button
            title="Start Basic Quiz"
            onPress={() => handleQuizSelect(allQuizMocks[0])}
            variant="outline"
            style={styles.quickStartButton}
          />
        </Card>

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
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  quizGrid: {
    padding: 24,
    gap: 20,
  },
  quizCard: {
    padding: 20,
    borderRadius: 16,
  },
  quizHeader: {
    marginBottom: 16,
  },
  quizTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quizTitle: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  quizDescription: {
    lineHeight: 20,
  },
  quizStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '600',
  },
  questionTypes: {
    marginBottom: 20,
  },
  questionTypesLabel: {
    fontSize: 11,
    marginBottom: 8,
    fontWeight: '500',
  },
  questionTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  questionTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  moreTypes: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  startButton: {
    paddingVertical: 14,
  },
  quickStartCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  quickStartTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickStartDescription: {
    lineHeight: 20,
    marginBottom: 16,
  },
  quickStartButton: {
    paddingVertical: 12,
  },
  bottomPadding: {
    height: 40,
  },
});