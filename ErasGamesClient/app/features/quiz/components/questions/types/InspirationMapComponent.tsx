import React from 'react';
import { StyleSheet } from 'react-native';
import { InspirationMapQuestion } from '../../../../../shared/interfaces/questions/inspiration-map.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { MultipleChoiceComponent } from '../common/MultipleChoiceComponent';
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

  return (
    <View style={styles.container}>
      {/* Question Title */}
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      {/* Disclaimer if provided */}
      {question.prompt.disclaimer && (
        <View style={[styles.disclaimerContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="caption" style={[styles.disclaimerLabel, { color: theme.colors.warning }]}>
            ⚠️ DISCLAIMER:
          </Text>
          <Text variant="body" style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
            {question.prompt.disclaimer}
          </Text>
        </View>
      )}

      {/* Multiple Choice Options */}
      <MultipleChoiceComponent
        choices={question.choices || []}
        selectedIndex={selectedChoiceIndex}
        onSelect={handleChoiceSelect}
        disabled={disabled}
        showCorrect={showCorrect}
        correctIndex={correctChoiceIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  disclaimerContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    marginBottom: 12,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  disclaimerLabel: {
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  disclaimerText: {
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
    fontSize: 15,
  },
});