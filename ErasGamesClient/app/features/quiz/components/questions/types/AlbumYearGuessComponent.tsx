import React from 'react';
import { AlbumYearGuessQuestion } from '../../../../../shared/interfaces/questions/album-year-guess.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { MultipleChoiceComponent } from '../common/MultipleChoiceComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface AlbumYearGuessComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: AlbumYearGuessQuestion;
}

export const AlbumYearGuessComponent: React.FC<AlbumYearGuessComponentProps> = ({
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
      
      <View style={[styles.albumContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="heading2" style={[styles.albumName, { color: theme.colors.primary }]}>
          "{question.prompt.album}"
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
  albumContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  albumName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});