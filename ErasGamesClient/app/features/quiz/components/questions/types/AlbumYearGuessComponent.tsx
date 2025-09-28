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
      <Text variant="h3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.albumContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="h2" style={[styles.albumName, { color: theme.colors.primary }]}>
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
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    flexWrap: 'wrap',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  albumContainer: {
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
  albumName: {
    fontWeight: '900',
    textAlign: 'center',
    flexWrap: 'wrap',
    fontSize: 22,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});