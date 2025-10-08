import React from 'react';
import { LongestSongQuestion } from '../../../../../shared/interfaces/questions/longest-song.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface LongestSongComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: LongestSongQuestion;
}

export const LongestSongComponent: React.FC<LongestSongComponentProps> = ({
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

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;
    
    if (isCorrect) {
      return [styles.choiceButton, { backgroundColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.choiceButton, { backgroundColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.choiceButton, { backgroundColor: theme.colors.primary }];
    } else {
      return [styles.choiceButton, { backgroundColor: theme.colors.accent1 }];
    }
  };

  const getTextColor = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && index === selectedAnswer?.choiceIndex && index !== correctAnswer?.choiceIndex;
    
    if (isCorrect || isWrong || isSelected) {
      return theme.colors.textOnPrimary;
    }
    return theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      <View style={styles.choicesContainer}>
        {(question.choices || []).map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => handleChoiceSelect(index)}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Text style={[styles.choiceText, { color: getTextColor(index) }]}>
              {typeof choice === 'string' ? choice : choice.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  instructionContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
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