import React from 'react';
import { TimelineOrderQuestion } from '../../../../../shared/interfaces/questions/timeline-order.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { OrderingComponent, OrderingItem } from '../common/OrderingComponent';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet } from 'react-native';

interface TimelineOrderComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: TimelineOrderQuestion;
}

export const TimelineOrderComponent: React.FC<TimelineOrderComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const items: OrderingItem[] = question.prompt.items.map(item => ({
    id: item,
    label: item
  }));

  const handleReorder = (newOrder: string[]) => {
    onAnswerChange({ orderedItems: newOrder });
  };

  // Initialize with items in the order they appear in the prompt if no answer yet
  const currentOrder = selectedAnswer?.orderedItems || question.prompt.items;

  return (
    <View style={styles.container}>
      <Text variant="heading3" style={[styles.questionText, { color: theme.colors.text }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="caption" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          📅 Arrange these items in chronological order (earliest to latest)
        </Text>
      </View>

      <OrderingComponent
        items={items}
        orderedItems={currentOrder}
        onReorder={handleReorder}
        disabled={disabled}
        showCorrect={showCorrect}
        correctOrder={correctAnswer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  questionText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  instructionContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 229, 177, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});