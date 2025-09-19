import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { View, Text, Button } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

export interface OrderingItem {
  id: string;
  label: string;
}

export interface OrderingComponentProps {
  items: OrderingItem[];
  orderedItems: string[];
  onReorder: (newOrder: string[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctOrder?: string[];
}

export const OrderingComponent: React.FC<OrderingComponentProps> = ({
  items,
  orderedItems,
  onReorder,
  disabled = false,
  showCorrect = false,
  correctOrder
}) => {
  const theme = useTheme();

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    const newOrder = [...orderedItems];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    onReorder(newOrder);
  };

  const getItemStyle = (itemId: string, index: number) => {
    if (showCorrect && correctOrder) {
      const isCorrectPosition = correctOrder[index] === itemId;
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
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
      }
    ];
  };

  const getItemLabel = (itemId: string): string => {
    const item = items.find(i => i.id === itemId);
    return item?.label || itemId;
  };

  return (
    <View style={styles.container}>
      <Text variant="caption" style={[styles.instruction, { color: theme.colors.textSecondary }]}>
        Use ↑ ↓ arrows to reorder items
      </Text>
      {orderedItems.map((itemId, index) => (
        <View key={itemId} style={getItemStyle(itemId, index)}>
          <View style={styles.orderItemContent}>
            <Text variant="body" style={[styles.orderNumber, { color: theme.colors.textSecondary }]}>
              {index + 1}.
            </Text>
            <Text variant="body" style={[styles.orderLabel, { color: theme.colors.text }]}>
              {getItemLabel(itemId)}
            </Text>
            {!disabled && (
              <View style={styles.controls}>
                <Button
                  title="↑"
                  onPress={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  style={[styles.controlButton, { 
                    backgroundColor: index === 0 ? theme.colors.disabled : theme.colors.primary,
                    opacity: index === 0 ? 0.3 : 1
                  }]}
                  textStyle={styles.controlButtonText}
                />
                <Button
                  title="↓"
                  onPress={() => moveItem(index, Math.min(orderedItems.length - 1, index + 1))}
                  disabled={index === orderedItems.length - 1}
                  style={[styles.controlButton, { 
                    backgroundColor: index === orderedItems.length - 1 ? theme.colors.disabled : theme.colors.primary,
                    opacity: index === orderedItems.length - 1 ? 0.3 : 1
                  }]}
                  textStyle={styles.controlButtonText}
                />
              </View>
            )}
          </View>
        </View>
      ))}
      
      {!disabled && (
        <View style={styles.quickActions}>
          <Text variant="caption" style={[styles.quickActionsLabel, { color: theme.colors.textSecondary }]}>
            Quick Actions:
          </Text>
          <View style={styles.quickActionsButtons}>
            <Button
              title="🔀 Shuffle"
              onPress={() => {
                const shuffled = [...orderedItems].sort(() => Math.random() - 0.5);
                onReorder(shuffled);
              }}
              variant="outline"
              style={styles.quickActionButton}
              textStyle={styles.quickActionText}
            />
            <Button
              title="↩️ Reverse"
              onPress={() => {
                const reversed = [...orderedItems].reverse();
                onReorder(reversed);
              }}
              variant="outline"
              style={styles.quickActionButton}
              textStyle={styles.quickActionText}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 8,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  orderItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  orderItemSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#e8f4fd',
  },
  orderItemCorrect: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  orderItemIncorrect: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  orderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 24,
  },
  orderLabel: {
    flex: 1,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'column',
    gap: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
    color: 'white',
  },
  quickActions: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionsLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  quickActionsButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickActionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});