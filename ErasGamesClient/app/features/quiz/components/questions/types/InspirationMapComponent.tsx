import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { InspirationMapQuestion } from '../../../../../shared/interfaces/questions/inspiration-map.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

interface InspirationMapComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: InspirationMapQuestion;
}

export const InspirationMapComponent: React.FC<InspirationMapComponentProps> = ({
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
    onAnswerChange({ choiceIndex });
  };

  const selectedChoiceIndex = typeof selectedAnswer === 'object' && selectedAnswer?.choiceIndex !== undefined 
    ? selectedAnswer.choiceIndex 
    : typeof selectedAnswer === 'number' 
    ? selectedAnswer 
    : null;

  const correctChoiceIndex = typeof correctAnswer === 'number' 
    ? correctAnswer 
    : null;

  const getChoiceStyle = (index: number) => {
    const isSelected = selectedChoiceIndex === index;
    const isCorrect = showCorrect && index === correctChoiceIndex;
    const isWrong = showCorrect && index === selectedChoiceIndex && index !== correctChoiceIndex;
    
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
    const isSelected = selectedChoiceIndex === index;
    const isCorrect = showCorrect && index === correctChoiceIndex;
    const isWrong = showCorrect && index === selectedChoiceIndex && index !== correctChoiceIndex;
    
    if (isCorrect || isWrong || isSelected) {
      return theme.colors.textOnPrimary;
    }
    return theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      {/* Question Title */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      {/* Disclaimer if provided */}
      {question.prompt.disclaimer && (
        <View style={[styles.disclaimerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
          <Text style={[styles.disclaimerLabel, { color: theme.colors.textSecondary }]}>
            ⚠️ DISCLAIMER:
          </Text>
          <Text style={[styles.disclaimerText, { color: theme.colors.textPrimary }]}>
            {question.prompt.disclaimer}
          </Text>
        </View>
      )}

      {/* Choice Options */}
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
    flex: 1,
    gap: 20,
  },
  simpleQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  disclaimerContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    gap: 8,
  },
  disclaimerLabel: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  disclaimerText: {
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
    fontSize: 15,
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