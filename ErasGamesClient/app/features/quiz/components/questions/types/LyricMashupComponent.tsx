import React, { useState } from 'react';
import { LyricMashupQuestion } from '../../../../../shared/interfaces/questions/lyric-mashup.interface';
import { QuestionComponentProps } from '../QuestionRenderer';
import { View, Text } from '../../../../../ui';
import { useTheme } from '../../../../../core/theme/ThemeProvider';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface LyricMashupComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: LyricMashupQuestion;
}

export const LyricMashupComponent: React.FC<LyricMashupComponentProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  showCorrect,
  correctAnswer,
  showHint
}) => {
  const theme = useTheme();

  const handleMatchChange = (matches: Record<string, string>) => {
    onAnswerChange(matches);
  };

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftItemPress = (leftItem: string) => {
    if (disabled) return;
    setSelectedLeft(leftItem === selectedLeft ? null : leftItem);
  };

  const handleRightItemPress = (rightItem: string) => {
    if (disabled || !selectedLeft) return;
    
    const newMatches = { ...(selectedAnswer || {}) };
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
    
    handleMatchChange(newMatches);
    setSelectedLeft(null);
  };

  const getLeftItemStyle = (leftItem: string) => {
    const isSelected = selectedLeft === leftItem;
    const hasMatch = (selectedAnswer || {})[leftItem];
    
    if (showCorrect && correctAnswer) {
      const isCorrect = correctAnswer[leftItem] === (selectedAnswer || {})[leftItem];
      if (hasMatch) {
        return [
          styles.matchItem,
          {
            backgroundColor: isCorrect ? theme.colors.success : theme.colors.error,
          }
        ];
      }
    }
    
    return [
      styles.matchItem,
      {
        backgroundColor: isSelected ? theme.colors.primary : (hasMatch ? theme.colors.accent1 : theme.colors.background),
        borderColor: theme.colors.accent1,
      }
    ];
  };

  const getRightItemStyle = (rightItem: string) => {
    const isMatched = Object.values(selectedAnswer || {}).includes(rightItem);
    
    if (showCorrect && correctAnswer) {
      const correctLeftItem = Object.keys(correctAnswer).find(key => correctAnswer[key] === rightItem);
      const actualLeftItem = Object.keys(selectedAnswer || {}).find(key => (selectedAnswer || {})[key] === rightItem);
      const isCorrect = correctLeftItem === actualLeftItem;
      
      if (isMatched) {
        return [
          styles.matchItem,
          {
            backgroundColor: isCorrect ? theme.colors.success : theme.colors.error,
          }
        ];
      }
    }
    
    return [
      styles.matchItem,
      {
        backgroundColor: isMatched ? theme.colors.accent1 : theme.colors.background,
        borderColor: theme.colors.accent1,
      }
    ];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.simpleQuestionText, { color: theme.colors.textPrimary }]}>
        {question.prompt.task}
      </Text>
      
      <View style={[styles.instructionContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent1 }]}>
        <Text style={[styles.instructionText, { color: theme.colors.textPrimary }]}>
          🎤 Match each lyric snippet to its correct song
        </Text>
      </View>

      <View style={styles.matchingGrid}>
        <View style={styles.column}>
          <Text style={[styles.columnHeader, { color: theme.colors.accent4 }]}>
            Lyrics 🎵
          </Text>
          {question.prompt.snippets?.map((item) => {
            const hasMatch = (selectedAnswer || {})[item];
            const textColor = showCorrect && correctAnswer ? 
              theme.colors.textOnPrimary :
              (selectedLeft === item ? theme.colors.textOnPrimary : (hasMatch ? theme.colors.accent4 : theme.colors.textPrimary));
              
            return (
              <TouchableOpacity
                key={item}
                style={getLeftItemStyle(item)}
                onPress={() => handleLeftItemPress(item)}
                disabled={disabled}
                activeOpacity={0.8}
              >
                <Text style={[styles.itemText, { color: textColor }]}>
                  "{item}"
                </Text>
                {hasMatch && (
                  <Text style={[styles.matchIndicator, { color: textColor, opacity: 0.7 }]}>
                    → {hasMatch}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        <View style={styles.column}>
          <Text style={[styles.columnHeader, { color: theme.colors.accent4 }]}>
            Songs 🎶
          </Text>
          {question.prompt.optionsPerSnippet?.map((item) => {
            const isMatched = Object.values(selectedAnswer || {}).includes(item);
            const textColor = showCorrect && correctAnswer ? 
              theme.colors.textOnPrimary :
              (isMatched ? theme.colors.accent4 : theme.colors.textPrimary);
              
            return (
              <TouchableOpacity
                key={item}
                style={getRightItemStyle(item)}
                onPress={() => handleRightItemPress(item)}
                disabled={disabled || !selectedLeft}
                activeOpacity={0.8}
              >
                <Text style={[styles.itemText, { color: textColor }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  matchingGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  matchIndicator: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});