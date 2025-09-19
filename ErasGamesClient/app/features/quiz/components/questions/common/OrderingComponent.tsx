import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { View, Text } from '../../../../../ui';
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
        Drag items to reorder them
      </Text>
      {orderedItems.map((itemId, index) => (
        <Pressable
          key={itemId}
          style={getItemStyle(itemId, index)}
          disabled={disabled}
          onPress={() => {
            // Simple tap to move to top functionality
            if (!disabled && index > 0) {
              moveItem(index, 0);
            }
          }}
        >
          <View style={styles.orderItemContent}>
            <Text variant="body" style={[styles.orderNumber, { color: theme.colors.textSecondary }]}>
              {index + 1}.
            </Text>
            <Text variant="body" style={[styles.orderLabel, { color: theme.colors.text }]}>
              {getItemLabel(itemId)}
            </Text>
            {!disabled && (
              <Text variant="caption" style={[styles.dragHandle, { color: theme.colors.textSecondary }]}>
                ⋮⋮
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  instruction: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  orderItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  orderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 20,
  },
  orderLabel: {
    flex: 1,
    fontSize: 14,
  },
  dragHandle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});