import React from 'react';
import { MoodMatchQuestion } from '../../../../../shared/interfaces/questions/mood-match.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface MoodMatchComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: MoodMatchQuestion;
}

export const MoodMatchComponent: React.FC<MoodMatchComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  // Debug logging
  console.log('MoodMatchComponent Debug:', {
    question,
    questionType: question.questionType,
    prompt: question.prompt,
    choices: question.choices,
    choicesLength: question.choices?.length,
    correctAnswer
  });

  const handleChoiceSelect = (index: number) => {
    if (!disabled) {
      onAnswerChange({ choiceIndex: index });
    }
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    // Handle both formats: correctAnswer as number or object with choiceIndex
    const correctIndex = typeof correctAnswer === 'number' ? correctAnswer : correctAnswer?.choiceIndex;
    const isCorrect = showCorrect && index === correctIndex;
    const isWrong = showCorrect && isSelected && index !== correctIndex;

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

  const getChoiceTextStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    // Handle both formats: correctAnswer as number or object with choiceIndex
    const correctIndex = typeof correctAnswer === 'number' ? correctAnswer : correctAnswer?.choiceIndex;
    const isCorrect = showCorrect && index === correctIndex;
    const isWrong = showCorrect && isSelected && index !== correctIndex;

    if (isCorrect || isWrong || isSelected) {
      return [styles.choiceText, { color: theme.colors.textOnPrimary }];
    } else {
      return [styles.choiceText, { color: theme.colors.accent4 }];
    }
  };

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      {/* Multiple Choice Options */}
      <View style={styles.choicesContainer}>
        {question.choices && question.choices.length > 0 ? (
          question.choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={getChoiceStyle(index)}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={getChoiceTextStyle(index)}>
                {typeof choice === 'string' ? choice : choice?.text || choice?.id || `Option ${index + 1}`}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noChoicesContainer}>
            <Text variant="body" style={[styles.noChoicesText, { color: theme.colors.textSecondary }]}>
              No mood options available
            </Text>
          </View>
        )}
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
    letterSpacing: 0.5,
  },
  noChoicesContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  noChoicesText: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});