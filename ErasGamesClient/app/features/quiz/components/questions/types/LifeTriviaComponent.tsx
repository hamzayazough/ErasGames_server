import React from 'react';
import { LifeTriviaQuestion } from '../../../../../shared/interfaces/questions/life-trivia.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../../../../ui/Text';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface LifeTriviaComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: LifeTriviaQuestion;
}

export const LifeTriviaComponent: React.FC<LifeTriviaComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleChoiceSelect = (choiceIndex: number) => {
    if (!disabled) {
      onAnswerChange({ choiceIndex });
    }
  };

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && isSelected && index !== correctAnswer?.choiceIndex;

    if (isCorrect) {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.success,
          borderColor: theme.colors.success,
        }
      ];
    } else if (isWrong) {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        }
      ];
    } else if (isSelected) {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        }
      ];
    } else {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }
      ];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && isSelected && index !== correctAnswer?.choiceIndex;

    if (isCorrect || isWrong || isSelected) {
      return { color: 'white' };
    }
    return { color: theme.colors.text };
  };

  return (
    <View style={styles.container}>
      {/* Header with icon and category */}
      <View style={[styles.headerSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerText}>
          <Text variant="caption" style={[styles.categoryLabel, { color: theme.colors.primary }]}>
            LIFE TRIVIA
          </Text>
          <Text variant="body" style={[styles.taskText, { color: theme.colors.textSecondary }]}>
            {question.prompt.task}
          </Text>
        </View>
      </View>

      {/* Main trivia question */}
      <View style={styles.questionSection}>
        <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
          {question.prompt.question}
        </Text>
      </View>

      {/* Answer choices */}
      <View style={styles.choicesSection}>
        {question.choices?.map((choice, index) => (
          <Pressable
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => handleChoiceSelect(index)}
            disabled={disabled}
          >
            <View style={styles.choiceContent}>
              <View style={[styles.choiceNumber, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text variant="body" style={[styles.choiceNumberText, { color: theme.colors.primary }]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text
                variant="body"
                style={[styles.choiceText, getChoiceTextStyle(index)]}
              >
                {typeof choice === 'string' ? choice : choice.text}
              </Text>
            </View>
          </Pressable>
        )) || (
          <View style={styles.noChoicesContainer}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              No answer choices available
            </Text>
          </View>
        )}
      </View>

      {/* Hint section */}
      {showHint && question.hint && (
        <View style={[styles.hintContainer, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text variant="caption" style={[styles.hintText, { color: theme.colors.text }]}>
            💡 Hint: {question.hint}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskText: {
    fontSize: 14,
    fontWeight: '500',
  },
  questionSection: {
    paddingHorizontal: 8,
  },
  questionText: {
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  choicesSection: {
    gap: 12,
  },
  choiceItem: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  choiceNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  choiceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  noChoicesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  hintContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
  },
});