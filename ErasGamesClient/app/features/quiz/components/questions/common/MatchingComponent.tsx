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
    gap: 16,
  },
  instruction: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  matchingGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  columnHeader: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  matchItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedItem: {
    borderWidth: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  itemText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  matchIndicator: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
});