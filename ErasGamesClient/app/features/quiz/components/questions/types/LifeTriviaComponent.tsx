import React from 'react';
import { LifeTriviaQuestion } from '../../../../../shared/interfaces/questions/life-trivia.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
        }
      ];
    } else if (isWrong) {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.error,
        }
      ];
    } else if (isSelected) {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.primary,
        }
      ];
    } else {
      return [
        styles.choiceItem,
        {
          backgroundColor: theme.colors.accent1,
        }
      ];
    }
  };

  const getChoiceTextStyle = (index: number) => {
    const isSelected = selectedAnswer?.choiceIndex === index;
    const isCorrect = showCorrect && index === correctAnswer?.choiceIndex;
    const isWrong = showCorrect && isSelected && index !== correctAnswer?.choiceIndex;

    if (isCorrect || isWrong || isSelected) {
      return { color: theme.colors.textOnPrimary };
    }
    return { color: theme.colors.textSecondary };
  };

  return (
    <View style={styles.container}>
      {/* Simple question text */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>

      {/* Main trivia question in teal container */}
      <View style={[styles.questionContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.categoryLabel, { color: theme.colors.textSecondary }]}>
          🧠 LIFE TRIVIA
        </Text>
        <Text style={[styles.questionText, { color: theme.colors.textPrimary }]}>
          {question.prompt.question}
        </Text>
      </View>

      {/* Answer choices */}
      <View style={styles.choicesSection}>
        {question.choices?.map((choice, index) => (
          <TouchableOpacity
            key={index}
            style={getChoiceStyle(index)}
            onPress={() => handleChoiceSelect(index)}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <View style={styles.choiceContent}>
              <View style={[styles.choiceNumber, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.choiceNumberText, { color: theme.colors.textOnPrimary }]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[styles.choiceText, getChoiceTextStyle(index)]}>
                {typeof choice === 'string' ? choice : choice.text}
              </Text>
            </View>
          </TouchableOpacity>
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
  },
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  questionContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    gap: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  questionText: {
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  choicesSection: {
    gap: 16,
  },
  choiceItem: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
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
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  noChoicesContainer: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  hintContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  hintText: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '500',
  },
});