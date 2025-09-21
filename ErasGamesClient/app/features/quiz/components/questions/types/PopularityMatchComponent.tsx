import React from 'react';
import { PopularityMatchQuestion } from '../../../../../shared/interfaces/questions/popularity-match.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { OrderingComponent, OrderingItem } from '../common/OrderingComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface PopularityMatchComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: PopularityMatchQuestion;
}

export const PopularityMatchComponent: React.FC<PopularityMatchComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  // Convert choices to ordering items
  const items: OrderingItem[] = (question.choices || []).map(choice => ({
    id: typeof choice === 'string' ? choice : choice.id,
    label: typeof choice === 'string' ? choice : choice.text || choice.id
  }));

  const handleReorder = (newOrder: string[]) => {
    onAnswerChange({ orderedChoices: newOrder });
  };

  // Initialize with items in the order they appear in choices if no answer yet
  const currentOrder = selectedAnswer?.orderedChoices || items.map(item => item.id);

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surface }]}>
        {question.prompt.asOf && (
          <Text variant="caption" style={[styles.asOfText, { color: theme.colors.textSecondary }]}>
            (As of {question.prompt.asOf})
          </Text>
        )}
      </View>

      <OrderingComponent
        items={items}
        orderedItems={currentOrder}
        onReorder={handleReorder}
        disabled={disabled}
        showCorrect={showCorrect}
        correctOrder={correctAnswer?.values}
      />
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
  },
  instructionContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 13,
    textAlign: 'center',
  },
  asOfText: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});