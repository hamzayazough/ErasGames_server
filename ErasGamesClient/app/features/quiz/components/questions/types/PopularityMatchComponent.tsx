import React from 'react';
import { PopularityMatchQuestion } from '../../../../../shared/interfaces/questions/popularity-match.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

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
  const items = (question.choices || []).map(choice => ({
    id: typeof choice === 'string' ? choice : choice.id,
    label: typeof choice === 'string' ? choice : choice.text || choice.id
  }));

  const handleReorder = (newOrder: string[]) => {
    onAnswerChange({ orderedChoices: newOrder });
  };

  // Initialize with items in the order they appear in choices if no answer yet
  const currentOrder = selectedAnswer?.orderedChoices || items.map(item => item.id);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    handleReorder(newOrder);
  };

  const getItemStyle = (itemId: string, index: number) => {
    if (showCorrect && correctAnswer?.values) {
      const isCorrectPosition = correctAnswer.values[index] === itemId;
      return [
        styles.orderItem,
        {
          backgroundColor: isCorrectPosition ? theme.colors.success : theme.colors.error,
        }
      ];
    }
    
    return [
      styles.orderItem,
      {
        backgroundColor: theme.colors.accent1,
      }
    ];
  };

  const getTextColor = (itemId: string, index: number) => {
    if (showCorrect && correctAnswer?.values) {
      return theme.colors.textOnPrimary;
    }
    return theme.colors.textSecondary;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        {question.prompt.asOf && (
          <Text style={[styles.asOfText, { color: theme.colors.textSecondary }]}>
            (As of {question.prompt.asOf})
          </Text>
        )}
      </View>

      <View style={styles.orderingContainer}>
        {currentOrder.map((itemId, index) => {
          const item = items.find(i => i.id === itemId);
          return (
            <View key={itemId} style={styles.orderItemWrapper}>
              <View style={[styles.orderNumber, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.orderNumberText, { color: theme.colors.textOnPrimary }]}>
                  {index + 1}
                </Text>
              </View>
              
              <View style={getItemStyle(itemId, index)}>
                <View style={styles.orderItemContent}>
                  <Text style={[styles.itemText, { color: getTextColor(itemId, index) }]}>
                    {item?.label || itemId}
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
                <View style={[styles.popularityConnector, { backgroundColor: theme.colors.accent1 }]} />
              )}
            </View>
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
  instructionContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    gap: 4,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  asOfText: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  orderingContainer: {
    gap: 8,
    paddingVertical: 8,
  },
  orderItemWrapper: {
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
  popularityConnector: {
    width: 2,
    height: 16,
    marginLeft: 7,
    marginTop: 4,
  },
});