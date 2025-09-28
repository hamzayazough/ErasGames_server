import React from 'react';
import { AlbumYearGuessQuestion } from '../../../../../shared/interfaces/questions/album-year-guess.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

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
      {/* Question Box - Teal background like in the image */}
      <View style={[styles.questionBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.questionText, { color: theme.colors.textSecondary }]}>
          {question.prompt.task}
        </Text>
      </View>

      {/* Answer Choices - Cream/beige buttons like in the image */}
      <View style={styles.choicesContainer}>
        {question.choices?.map((choice, index) => {
          const isSelected = selectedAnswer?.choiceIndex === index;
          const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
          const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;
          
          let buttonStyle = [styles.choiceButton];
          let textStyle = [styles.choiceText];
          
          if (isCorrect) {
            buttonStyle.push({ backgroundColor: theme.colors.success });
            textStyle.push({ color: theme.colors.textOnPrimary });
          } else if (isWrong) {
            buttonStyle.push({ backgroundColor: theme.colors.error });
            textStyle.push({ color: theme.colors.textOnPrimary });
          } else if (isSelected) {
            buttonStyle.push({ backgroundColor: theme.colors.primary });
            textStyle.push({ color: theme.colors.textOnPrimary });
          } else {
            buttonStyle.push({ backgroundColor: theme.colors.accent1 });
            textStyle.push({ color: theme.colors.accent4 });
          }

          return (
            <TouchableOpacity
              key={choice.id || index}
              style={buttonStyle}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={textStyle}>
                {choice.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  questionBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  choicesContainer: {
    gap: 16,
    marginTop: 8,
  },
  choiceButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});