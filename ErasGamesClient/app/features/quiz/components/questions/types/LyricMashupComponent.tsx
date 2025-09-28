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
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  instructionContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});