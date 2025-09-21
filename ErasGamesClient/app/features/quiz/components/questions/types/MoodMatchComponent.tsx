import React from 'react';
import { MoodMatchQuestion } from '../../../../../shared/interfaces/questions/mood-match.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
      return [styles.choiceButton, styles.correctChoice, { borderColor: theme.colors.success }];
    } else if (isWrong) {
      return [styles.choiceButton, styles.wrongChoice, { borderColor: theme.colors.error }];
    } else if (isSelected) {
      return [styles.choiceButton, styles.selectedChoice, { borderColor: theme.colors.primary }];
    } else {
      return [styles.choiceButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    // Handle both formats: correctAnswer as number or object with choiceIndex
    const correctIndex = typeof correctAnswer === 'number' ? correctAnswer : correctAnswer?.choiceIndex;
    const isCorrect = showCorrect && index === correctIndex;
    const isWrong = showCorrect && selectedAnswer?.choiceIndex === index && index !== correctIndex;

    if (isCorrect) {
      return [styles.choiceText, { color: theme.colors.textOnSuccess }];
    } else if (isWrong) {
      return [styles.choiceText, { color: theme.colors.textOnError }];
    } else {
      return [styles.choiceText, { color: theme.colors.text }];
    }
  };

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>

      {/* Multiple Choice Options */}
      <View style={styles.choicesContainer}>
        {question.choices && question.choices.length > 0 ? (
          question.choices.map((choice, index) => (
            <Pressable
              key={index}
              style={getChoiceStyle(index)}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
            >
              <Text variant="body" style={getChoiceTextStyle(index)}>
                {typeof choice === 'string' ? choice : choice?.text || choice?.id || `Option ${index + 1}`}
              </Text>
            </Pressable>
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
  questionText: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChoice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  correctChoice: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  wrongChoice: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  noChoicesContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noChoicesText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});