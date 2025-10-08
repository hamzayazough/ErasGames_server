import React from 'react';
import { OddOneOutQuestion } from '../../../../../shared/interfaces/questions/odd-one-out.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface OddOneOutComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: OddOneOutQuestion;
}

export const OddOneOutComponent: React.FC<OddOneOutComponentProps> = ({
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
      {/* Question Instruction - Simple text since it's not the main focus */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      {/* Rule container with teal theme */}
      <View style={[styles.ruleContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.ruleText, { color: theme.colors.textSecondary }]}>
          Rule: {question.prompt.setRule}
        </Text>
      </View>

      {/* Answer Choices - Cream/beige buttons */}
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
            textStyle.push({ color: theme.colors.textSecondary });
          }

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              onPress={() => handleChoiceSelect(index)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={textStyle}>
                {typeof choice === 'string' ? choice : choice.text}
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
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  ruleContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    flexDirection: 'row',
  },
  ruleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  ruleText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
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