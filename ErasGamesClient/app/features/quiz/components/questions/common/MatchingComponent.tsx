import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingComponentProps {
  leftItems: string[];
  rightItems: string[];
  matches: Record<string, string>;
  onMatchChange: (matches: Record<string, string>) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  correctMatches?: Record<string, string>;
}

export const MatchingComponent: React.FC<MatchingComponentProps> = ({
  leftItems,
  rightItems,
  matches,
  onMatchChange,
  disabled = false,
  showCorrect = false,
  correctMatches
}) => {
  const theme = useTheme();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftItemPress = (leftItem: string) => {
    if (disabled) return;
    setSelectedLeft(leftItem === selectedLeft ? null : leftItem);
  };

  const handleRightItemPress = (rightItem: string) => {
    if (disabled || !selectedLeft) return;
    
    const newMatches = { ...matches };
    // Remove any existing match for this left item
    delete newMatches[selectedLeft];
    // Remove any existing match to this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === rightItem) {
        delete newMatches[key];
      }
    });
    // Add new match
    newMatches[selectedLeft] = rightItem;
    
    onMatchChange(newMatches);
    setSelectedLeft(null);
  };

  const getLeftItemStyle = (leftItem: string) => {
    const isSelected = selectedLeft === leftItem;
    const hasMatch = matches[leftItem];
    
    if (showCorrect && correctMatches) {
      const isCorrect = correctMatches[leftItem] === matches[leftItem];
      return [
        styles.matchItem,
        {
          backgroundColor: isCorrect ? theme.colors.success : theme.colors.error,
          borderColor: isCorrect ? theme.colors.success : theme.colors.error,
        }
      ];
    }
    
    if (isSelected) {
      return [
        styles.matchItem,
        styles.selectedItem,
        {
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
        }
      ];
    }
    
    return [
      styles.matchItem,
      {
        backgroundColor: hasMatch ? theme.colors.surface : theme.colors.card,
        borderColor: hasMatch ? theme.colors.primary : theme.colors.border,
      }
    ];
  };

  const getRightItemStyle = (rightItem: string) => {
    const isMatched = Object.values(matches).includes(rightItem);
    
    if (showCorrect && correctMatches) {
      const correctLeftItem = Object.keys(correctMatches).find(key => correctMatches[key] === rightItem);
      const actualLeftItem = Object.keys(matches).find(key => matches[key] === rightItem);
      const isCorrect = correctLeftItem === actualLeftItem;
      
      return [
        styles.matchItem,
        {
          backgroundColor: isCorrect ? theme.colors.success : theme.colors.error,
          borderColor: isCorrect ? theme.colors.success : theme.colors.error,
        }
      ];
    }
    
    return [
      styles.matchItem,
      {
        backgroundColor: isMatched ? theme.colors.surface : theme.colors.card,
        borderColor: isMatched ? theme.colors.primary : theme.colors.border,
      }
    ];
  };

  return (
    <View style={styles.container}>
      <Text variant="caption" style={[styles.instruction, { color: theme.colors.textSecondary }]}>
        Tap an item on the left, then tap its match on the right
      </Text>
      
      <View style={styles.matchingGrid}>
        <View style={styles.column}>
          <Text variant="body" style={[styles.columnHeader, { color: theme.colors.text }]}>
            Match these:
          </Text>
          {leftItems.map((item) => (
            <Pressable
              key={item}
              style={getLeftItemStyle(item)}
              onPress={() => handleLeftItemPress(item)}
              disabled={disabled}
            >
              <Text variant="body" style={[styles.itemText, { color: theme.colors.text }]}>
                {item}
              </Text>
              {matches[item] && (
                <Text variant="caption" style={[styles.matchIndicator, { color: theme.colors.primary }]}>
                  → {matches[item]}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
        
        <View style={styles.column}>
          <Text variant="body" style={[styles.columnHeader, { color: theme.colors.text }]}>
            With these:
          </Text>
          {rightItems.map((item) => (
            <Pressable
              key={item}
              style={getRightItemStyle(item)}
              onPress={() => handleRightItemPress(item)}
              disabled={disabled}
            >
              <Text variant="body" style={[styles.itemText, { color: theme.colors.text }]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  instruction: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  matchingGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  matchItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  selectedItem: {
    borderWidth: 2,
  },
  itemText: {
    fontSize: 13,
    textAlign: 'center',
  },
  matchIndicator: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});