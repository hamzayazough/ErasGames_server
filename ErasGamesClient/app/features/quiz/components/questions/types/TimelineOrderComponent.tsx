import React from 'react';
import { TimelineOrderQuestion } from '../../../../../shared/interfaces/questions/timeline-order.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

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

  const handleReorder = (newOrder: string[]) => {
    onAnswerChange({ orderedItems: newOrder });
  };

  // Initialize with items in the order they appear in the prompt if no answer yet
  const currentOrder = selectedAnswer?.orderedItems || question.prompt.items;

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    handleReorder(newOrder);
  };

  const getItemStyle = (itemId: string, index: number) => {
    if (showCorrect && correctAnswer?.orderedItems) {
      const isCorrectPosition = correctAnswer.orderedItems[index] === itemId;
      return [
        styles.orderItem,
        {
          backgroundColor: isCorrectPosition ? theme.colors.success : theme.colors.error,
          borderColor: isCorrectPosition ? theme.colors.success : theme.colors.error,
        }
      ];
    }
    
    return [
      styles.orderItem,
      {
        backgroundColor: theme.colors.accent1,
        borderColor: theme.colors.accent1,
      }
    ];
  };

  const getTextColor = (itemId: string, index: number) => {
    if (showCorrect && correctAnswer?.orderedItems) {
      return theme.colors.textOnPrimary;
    }
    return theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      {/* Question Instruction - Simple text */}
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      

      {/* Timeline Items */}
      <View style={styles.timelineContainer}>
        {currentOrder.map((itemId, index) => (
          <View key={itemId} style={styles.timelineItemWrapper}>
            <View style={[styles.orderNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.orderNumberText, { color: theme.colors.textOnPrimary }]}>
                {index + 1}
              </Text>
            </View>
            
            <View style={getItemStyle(itemId, index)}>
              <View style={styles.orderItemContent}>
                <Text style={[styles.itemText, { color: getTextColor(itemId, index) }]}>
                  {itemId}
                </Text>
                
                {!disabled && !showCorrect && (
                  <View style={styles.controls}>
                    {index > 0 && (
                      <TouchableOpacity
                        onPress={() => moveItem(index, Math.max(0, index - 1))}
                        style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.controlButtonText, { color: theme.colors.textOnPrimary }]}>↑</Text>
                      </TouchableOpacity>
                    )}
                    {index < currentOrder.length - 1 && (
                      <TouchableOpacity
                        onPress={() => moveItem(index, Math.min(currentOrder.length - 1, index + 1))}
                        style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.controlButtonText, { color: theme.colors.textOnPrimary }]}>↓</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
            
            {index < currentOrder.length - 1 && (
              <View style={[styles.timelineConnector, { backgroundColor: theme.colors.accent1 }]} />
            )}
          </View>
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
  timelineContainer: {
    gap: 8,
    paddingVertical: 8,
  },
  timelineItemWrapper: {
    position: 'relative',
  },
  orderNumber: {
    position: 'absolute',
    left: -16,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  orderNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderItem: {
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  orderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'column',
    gap: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  timelineConnector: {
    width: 2,
    height: 16,
    marginLeft: 7,
    marginTop: 4,
  },
});