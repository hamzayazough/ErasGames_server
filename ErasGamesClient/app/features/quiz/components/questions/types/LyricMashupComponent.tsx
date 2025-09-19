import React from 'react';
import { LyricMashupQuestion } from '../../../../../shared/interfaces/questions/lyric-mashup.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MatchingComponent } from '../common/MatchingComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface LyricMashupComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: LyricMashupQuestion;
}

export const LyricMashupComponent: React.FC<LyricMashupComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleMatchChange = (matches: Record<string, string>) => {
    onAnswerChange(matches);
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          🎤 Match each lyric snippet to its correct song
        </Text>
      </View>

      <MatchingComponent
        leftItems={question.prompt.snippets}
        rightItems={question.prompt.optionsPerSnippet}
        matches={selectedAnswer || {}}
        onMatchChange={handleMatchChange}
        disabled={disabled}
        showCorrect={showCorrect}
        correctMatches={correctAnswer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  instructionContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 13,
    textAlign: 'center',
  },
});