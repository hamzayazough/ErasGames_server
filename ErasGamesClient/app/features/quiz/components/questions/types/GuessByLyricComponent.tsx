import React from 'react';
import { GuessByLyricQuestion } from '../../../../../shared/interfaces/questions/guess-by-lyric.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MultipleChoiceComponent } from '../common/MultipleChoiceComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface GuessByLyricComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: GuessByLyricQuestion;
}

export const GuessByLyricComponent: React.FC<GuessByLyricComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleChoiceSelect = (index: number) => {
    onAnswerChange({ choiceIndex: index });
  };

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.lyricContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.lyricLabel, { color: theme.colors.primary }]}>
          🎵 LYRIC:
        </Text>
        <Text variant="body" style={[styles.lyricText, { color: theme.colors.text }]}>
          "{question.prompt.lyric}"
        </Text>
      </View>

      <MultipleChoiceComponent
        choices={question.choices || []}
        selectedIndex={selectedAnswer?.choiceIndex ?? null}
        onSelect={handleChoiceSelect}
        disabled={disabled}
        showCorrect={showCorrect}
        correctIndex={correctAnswer?.choiceIndex}
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
  lyricContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lyricLabel: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 1,
  },
  lyricText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});