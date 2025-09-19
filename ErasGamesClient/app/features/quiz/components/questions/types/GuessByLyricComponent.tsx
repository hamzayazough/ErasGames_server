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
    gap: 20,
  },
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
  lyricContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  lyricLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lyricText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
});